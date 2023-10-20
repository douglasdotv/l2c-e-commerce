import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';
import { Observable, from, lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptorService implements HttpInterceptor {
  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.handleAccess(req, next));
  }

  private async handleAccess(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Promise<HttpEvent<any>> {
    const securedEndpoints: string[] = ['http://localhost:8080/api/orders'];
    if (securedEndpoints.some((url) => req.urlWithParams.includes(url))) {
      const accessToken: string | undefined = this.oktaAuth.getAccessToken();
      req = req.clone({
        setHeaders: {
          Authorization: 'Bearer ' + accessToken,
        },
      });
    }
    return await lastValueFrom(next.handle(req));
  }
}
