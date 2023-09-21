import { Component, Input, OnInit } from "@angular/core";

@Component({
	selector: "app-student-statement",
	templateUrl: "./student-statement.component.html",
	styleUrls: ["./student-statement.component.scss"]
})
export class StudentStatementComponent implements OnInit {

  @Input() termStatements: any;
  @Input() studentData: any;

  constructor() { }

  ngOnInit(): void {}

}
