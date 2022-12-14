import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { catchError } from "rxjs";
import { AuthService } from "../services/auth.service";

@Component({
  selector: "login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {}
  credentials = { email: "", password: "", role: "admin" };

  ngOnInit(): void {}
  readonly loginButtonPressed = () => {
    const { email, password, role } = this.credentials;
    if (email.trim() === "" || password.trim() === "") {
      alert("Please fill all the fields");
      return;
    }
    if (role === "student") {
      alert("Yet to make student portal");
    } else {
      this.authService.login(email, password).subscribe(
        (res) => {
          console.log("Logged in successfully");
          console.log(res);
          this.router.navigate(["/dashboard"]);
        },
        (err: any) => {
          alert("Invalid email or password");
        }
      );
    }
  };
}
