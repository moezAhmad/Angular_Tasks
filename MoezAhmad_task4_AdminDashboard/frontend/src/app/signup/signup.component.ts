import { Component, OnInit } from "@angular/core";
import { AuthService } from "app/services/auth.service";

@Component({
  selector: "signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  user = { name: "", email: "", password: "", role: "admin" };
  confirmPassword = "";
  constructor(private authService: AuthService) {}

  ngOnInit(): void {}
  readonly signUp = () => {
    if (
      this.user.name.trim() === "" ||
      this.user.email.trim() === "" ||
      this.user.password.trim() === ""
    ) {
      alert("Please fill all the fields");
      return;
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.user.email)
    ) {
      alert("Please enter a valid email");
      return;
    } else if (
      !/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/.test(
        this.user.password
      )
    ) {
      alert(
        "Password must contain atleast 8 characters with one uppercase, one lowercase, one special character and one number"
      );
      return;
    } else if (this.user.password !== this.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (this.user.role === "student") {
      this.authService
        .signUp(this.user.name, this.user.email, this.user.password)
        .subscribe((res) => {
          console.log(res);
        });
    } else {
      alert("Yet to make admin route");
    }
  };
}
