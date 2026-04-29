import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, Subscriber } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { throwError } from 'rxjs';

export const API_THROTTLE_LIMIT = new InjectionToken<number>('apiThrottleLimit');
export const API_THROTTLE_URL_REGEX = new InjectionToken<RegExp>('apiThrottleUrlRegex');

interface PendingRequest {
  request: HttpRequest<unknown>;
  next: HttpHandler;
  observer: Subscriber<HttpEvent<unknown>>;
}

@Injectable({
  providedIn: 'root',
})
export class ApiThrottleService {
  private activeRequests = 0;
  private readonly queue: PendingRequest[] = [];

  constructor(
    @Optional() @Inject(API_THROTTLE_LIMIT) private readonly throttleLimit: number | null,
    @Optional() @Inject(API_THROTTLE_URL_REGEX) private readonly urlRegex: RegExp | null,
  ) {}

  public intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    if (!this.shouldThrottle(request)) {
      return next.handle(request);
    }

    return new Observable<HttpEvent<unknown>>((observer) => {
      this.queue.push({ request, next, observer });
      this.processQueue();

      return () => {
        const queuedIndex = this.queue.findIndex((item) => item.observer === observer);
        if (queuedIndex >= 0) {
          this.queue.splice(queuedIndex, 1);
        }
      };
    });
  }

  private processQueue(): void {
    while (this.activeRequests < this.limit && this.queue.length > 0) {
      const pending = this.queue.shift();
      if (!pending) {
        return;
      }

      this.activeRequests++;
      this.executeRequest(pending);
    }
  }

  private executeRequest(pending: PendingRequest): void {
    pending.next
      .handle(pending.request)
      .pipe(
        tap((event) => {
          pending.observer.next(event as HttpEvent<unknown>);
          if (event instanceof HttpResponse) {
            pending.observer.complete();
          }
        }),
        catchError((error) => {
          pending.observer.error(error);
          return throwError(() => error);
        }),
      )
      .subscribe({
        error: () => {
          this.onRequestCompleted();
        },
        complete: () => {
          this.onRequestCompleted();
        },
      });
  }

  private onRequestCompleted(): void {
    if (this.activeRequests > 0) {
      this.activeRequests--;
    }
    this.processQueue();
  }

  private shouldThrottle(request: HttpRequest<unknown>): boolean {
    // Keep static resources and bootstrap auth/profile calls outside the queue.
    const url = request.url.toLowerCase();
    if (
      url.includes('/assets/') ||
      url.includes('userinfo') ||
      url.includes('envinfo')
    ) {
      return false;
    }

    const regex = this.urlRegex ?? /[?&](get|do|call)=/i;
    return regex.test(request.urlWithParams);
  }

  private get limit(): number {
    if (!this.throttleLimit || this.throttleLimit < 1) {
      return 3;
    }
    return this.throttleLimit;
  }
}
