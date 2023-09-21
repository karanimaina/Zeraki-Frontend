import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "app-student-details",
	templateUrl: "./student-details.component.html",
	styleUrls: ["./student-details.component.scss"]
})
export class StudentDetailsComponent implements OnInit {
	@Input() studentName!: string;
	@Input() studentAdmNo!: string;
	@Input() showAttendanceReport!: boolean;
	@Input() formOrYear!: string;
	@Input() streamName!: string;
	@Input() year!: string;
	@Input() term!: string | number;

	constructor() { }

	ngOnInit(): void {
	}

}
