import {Component, Input, OnInit} from "@angular/core";
import {StudentActivity} from "../../../../../../@core/models/student/student-activity";

@Component({
	selector: "app-activities",
	templateUrl: "./activities.component.html",
	styleUrls: ["./activities.component.scss"]
})
export class ActivitiesComponent implements OnInit {
	@Input() studentActivities: StudentActivity[] = [];

	constructor() { }

	ngOnInit(): void {
	}

}
