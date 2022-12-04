import { Component, OnInit } from "@angular/core";
import { StudentService } from "app/services/student.service";
import { response } from "express";
import { data } from "jquery";

@Component({
  selector: "app-user-profile",
  templateUrl: "./user-profile.component.html",
  styleUrls: ["./user-profile.component.css"],
})
export class UserProfileComponent implements OnInit {
  student = { _id: "", name: "", email: "", address: "", phone: "", cnic: "" };
  constructor(private studentService: StudentService) {}

  ngOnInit() {
    this.student = JSON.parse(localStorage.getItem("selectedStudent"));
    console.log(this.student);
  }
  readonly updateProfile = () => {
    if (
      this.student.name.trim() === "" ||
      this.student.email.trim() === "" ||
      this.student.address.trim() === "" ||
      this.student.phone.trim() === "" ||
      this.student.cnic.trim() === ""
    ) {
      alert("Please fill all the fields");
      return;
    } else if (
      !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.student.email)
    ) {
      alert("Please enter a valid email");
      return;
    } else if (!/^[0-9]{5}-[0-9]{7}-[0-9]$/.test(this.student.cnic)) {
      alert("Please enter a valid CNIC (xxxxx-xxxxxxx-x)");
      return;
    } else if (!/^[0-9]{11}$/.test(this.student.phone)) {
      alert("Please enter a valid phone number (xxxxxxxxxxx)");
      return;
    }
    this.studentService.updateStudent(this.student._id, this.student).subscribe(
      (response) => {
        console.log(response);
        alert("Profile updated successfully");
      },
      (error) => {
        alert("error occured");
      }
    );
  };
}
