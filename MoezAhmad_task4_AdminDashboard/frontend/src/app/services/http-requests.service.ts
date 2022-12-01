import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class HTTPRequestsService {
  readonly BASE_URL = "http://localhost:3000";
  constructor(private http: HttpClient) {}

  readonly getStudents = (uri: string) =>
    this.http.get(`${this.BASE_URL}${uri}`);

  readonly loginAdmin = (email: string, password: string) => {
    console.log(`${this.BASE_URL}/admins/login`);
    return this.http.post(
      `${this.BASE_URL}/admins/login`,
      { email, password },
      { observe: "response" }
    );
  };

  readonly updateStudent = (uri: string, student: Object) =>
    this.http.patch(`${this.BASE_URL}${uri}`, student, {
      responseType: "text",
    });

  readonly deleteStudent = (uri: string) =>
    this.http.delete(`${this.BASE_URL}${uri}`, {
      responseType: "text",
    });
}
