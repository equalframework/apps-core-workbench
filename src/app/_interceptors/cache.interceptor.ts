import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';

/**
  * This interceptor caches GET requests to 'userinfo' endpoint to prevent multiple identical requests,
  * Especially during app initialization when sb-shared-lib's AuthService makes a userinfo request to check authentication status.
  */
@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private requestCache = new Map<string, Observable<HttpEvent<any>>>();

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only cache get requests to userinfo
    if (request.method !== 'GET' || !request.url.includes('userinfo')) {
      return next.handle(request);
    }

    const cacheKey = request.url;

    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey)!;
    }

    const cachedRequest$ = next.handle(request).pipe(
      shareReplay(1)
    );

    this.requestCache.set(cacheKey, cachedRequest$);
    return cachedRequest$;
  }
}
