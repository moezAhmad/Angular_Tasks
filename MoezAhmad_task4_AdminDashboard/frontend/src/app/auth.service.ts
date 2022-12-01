import { HttpClient, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { HTTPRequestsService } from "./services/http-requests.service";
import { shareReplay, tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private httpReqService: HTTPRequestsService,
    private router: Router
  ) {}

  readonly login = (email: string, password: string) => {
    return this.httpReqService.loginAdmin(email, password).pipe(
      shareReplay(),
      tap((res: HttpResponse<any>) => {
        this.setSession(
          res.body._id,
          res.headers.get("x-access-token"),
          res.headers.get("x-refresh-token")
        );
        console.log("Logged in successfully");
      })
    );
  };

  getAccessToken = () => {
    return localStorage.getItem("x-access-token");
  };
  getRefreshToken = () => {
    return localStorage.getItem("x-refresh-token");
  };

  setAccessToken = (accessToken: string) => {
    localStorage.setItem("x-access-token", accessToken);
  };

  private setSession = (
    userId: string,
    accessToken: string,
    refreshToken: string
  ) => {
    localStorage.setItem("userId", userId);
    localStorage.setItem("x-access-token", accessToken);
    localStorage.setItem("x-refresh-token", refreshToken);
  };

  private removeSession = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("x-access-token");
    localStorage.removeItem("x-refresh-token");
  };

  readonly logout = () => {
    this.removeSession();
    this.router.navigate(["/login"]);
  };
}
