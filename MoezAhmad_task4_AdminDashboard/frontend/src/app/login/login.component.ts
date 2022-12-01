import { Component, OnInit } from "@angular/core";
import { AuthService } from "app/auth.service";

@Component({
  selector: "login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
  readonly loginButtonPressed = (email: string, password: string) => {
    this.authService.login(email, password).subscribe((res) => {
      console.log(res);
    });
  };
}
