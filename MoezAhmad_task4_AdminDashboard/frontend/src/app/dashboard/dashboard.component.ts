import { Component, OnInit } from "@angular/core";
import { StudentService } from "app/services/student.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
  students = [];
  constructor(private studentService: StudentService) {}
  ngOnInit() {
    this.studentService.getStudents().subscribe((data: any[]) => {
      this.students = data;
    });
  }
  readonly onEdit = (student: Object) => {
    localStorage.setItem("selectedStudent", JSON.stringify(student));
  };
}
