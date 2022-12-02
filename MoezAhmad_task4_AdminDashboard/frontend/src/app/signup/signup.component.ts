import { Component, OnInit } from "@angular/core";
import { AuthService } from "app/services/auth.service";

@Component({
  selector: "signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  admin = { _id: "", name: "", email: "", password: "" };
  confirmPassword = "";
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
  readonly signUp = () => {
    if (
      this.admin.name.trim() === "" ||
      this.admin.email.trim() === "" ||
      this.admin.password.trim() === ""
    ) {
      alert("Please fill all the fields");
      return;
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.admin.email)
    ) {
      alert("Please enter a valid email");
      return;
    } else if (
      !/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
        this.admin.password
      )
    ) {
      alert(
        "Password must contain atleast 8 characters with one uppercase, one lowercase, one special character and one number"
      );
      return;
    } else if (this.admin.password !== this.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    this.authService
      .signUp(this.admin.name, this.admin.email, this.admin.password)
      .subscribe((res) => {
        console.log(res);
      });
  };
}
