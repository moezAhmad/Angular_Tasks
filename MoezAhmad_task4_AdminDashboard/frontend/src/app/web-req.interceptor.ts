import {
  HttpErrorResponse,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { AuthService } from "./auth.service";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class WebReqInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    request = this.addAuthHeader(request);
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log(error);
        if (error.status === 401) {
          // We want to call auth service to refresh the access token

          this.authService.logout();
        }
        return throwError(() => new Error(error.message));
      })
    );
  }
  addAuthHeader = (request: HttpRequest<any>) => {
    const token = this.authService.getAccessToken();
    if (token) {
      return request.clone({
        setHeaders: {
          "x-access-token": token,
        },
      });
    }
    return request;
  };
}
