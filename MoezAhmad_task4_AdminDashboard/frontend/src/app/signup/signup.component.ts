import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AuthService } from "app/services/auth.service";

@Component({
  selector: "signup",
  templateUrl: "./signup.component.html",
  styleUrls: ["./signup.component.css"],
})
export class SignupComponent implements OnInit {
  user = {
    name: "",
    email: "",
    password: "",
    role: "admin",
    address: "",
    phone: "",
    cnic: "",
  };
  confirmPassword = "";
  constructor(private authService: AuthService, private router: Router) {}

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
    } else if (
      this.user.role === "student" &&
      !/^[0-9]{5}-[0-9]{7}-[0-9]$/.test(this.user.cnic)
    ) {
      alert("Please enter a valid CNIC (xxxxx-xxxxxxx-x)");
      return;
    } else if (
      this.user.role === "student" &&
      !/^[0-9]{11}$/.test(this.user.phone)
    ) {
      alert("Please enter a valid phone number (xxxxxxxxxxx)");
      return;
    } else if (
      this.user.role === "student" &&
      this.user.address.trim() === ""
    ) {
      alert("Address is empty");
      return;
    }

    if (this.user.role === "student") {
      this.authService
        .signUpStudent(
          this.user.name,
          this.user.email,
          this.user.password,
          this.user.address,
          this.user.phone,
          this.user.cnic
        )
        .subscribe(
          (res) => {
            console.log(res);
            this.authService.logout();
          },
          (err) => {
            console.log("User Already Exists");
          }
        );
    } else {
      this.authService
        .signUpAdmin(this.user.name, this.user.email, this.user.password)
        .subscribe(
          (res) => {
            console.log(res);
            this.router.navigate(["/dashboard"]);
          },
          (err) => {
            console.log("User Already Exists");
          }
        );
    }
  };
}
