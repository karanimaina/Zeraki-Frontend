import { Component, Input, OnInit } from "@angular/core";
import {Attendance} from "../../models/attendance-report";

@Component({
	selector: "app-attendance-report",
	templateUrl: "./attendance-report.component.html",
	styleUrls: ["./attendance-report.component.scss"]
})
export class AttendanceReportComponent implements OnInit {
	@Input() showAttendanceReport!: boolean;
	@Input() attendance!: Attendance;

	constructor() { }

	ngOnInit(): void {
	}

}
