import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { throwError } from 'rxjs';

/**
  * This interceptor caches GET requests to 'userinfo' endpoint to prevent multiple identical requests,
  * Especially during app initialization when sb-shared-lib's AuthService makes a userinfo request to check authentication status.
  */
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private requestCache = new Map<string, Observable<HttpEvent<any>>>();

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Cache a small set of repeated bootstrap/static calls to reduce duplicate network traffic.
    if (!this.shouldCacheRequest(request)) {
      return next.handle(request);
    }

    const cacheKey = `${request.method}:${request.urlWithParams}`;

    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey)!;
    }

    const cachedRequest$ = next.handle(request).pipe(
      catchError((error) => {
        this.requestCache.delete(cacheKey);
        return throwError(() => error);
      }),
      shareReplay(1)
    );

    this.requestCache.set(cacheKey, cachedRequest$);
    return cachedRequest$;
  }

  private shouldCacheRequest(request: HttpRequest<unknown>): boolean {
    if (request.method !== 'GET') {
      return false;
    }

    const url = request.url.toLowerCase();
    return (
      url.includes('userinfo') ||
      url.includes('envinfo') ||
      url.includes('/assets/i18n/')
    );
  }
}
