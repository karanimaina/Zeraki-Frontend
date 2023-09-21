import {Component, Input, OnInit} from "@angular/core";

@Component({
	selector: "app-school-dates",
	templateUrl: "./school-dates.component.html",
	styleUrls: ["../student-report/student-report.component.scss"]
})
export class SchoolDatesComponent implements OnInit {
	@Input() closingDate!: string;
	@Input() openingDate!: string;

	constructor() { }

	ngOnInit(): void {
	}

}
