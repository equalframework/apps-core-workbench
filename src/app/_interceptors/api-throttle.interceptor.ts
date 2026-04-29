import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiThrottleService } from '../_services/api-throttle.service';

@Injectable()
export class ApiThrottleInterceptor implements HttpInterceptor {
  constructor(private readonly apiThrottleService: ApiThrottleService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return this.apiThrottleService.intercept(request, next);
  }
}
