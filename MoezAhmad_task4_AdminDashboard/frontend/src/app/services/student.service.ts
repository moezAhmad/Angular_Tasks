import { Injectable } from "@angular/core";
import { HTTPRequestsService } from "./http-requests.service";

@Injectable({
  providedIn: "root",
})
export class StudentService {
  constructor(private httpReqService: HTTPRequestsService) {}

  readonly getStudents = () => this.httpReqService.getStudents("/students");

  readonly updateStudent = (id: string, student: Object) =>
    this.httpReqService.updateStudent(`/students/${id}`, student);

  readonly deleteStudent = (id: string) =>
    this.httpReqService.deleteStudent(`/students/${id}`);
}
