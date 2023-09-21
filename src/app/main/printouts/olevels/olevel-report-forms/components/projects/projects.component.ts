import {Component, Input, OnInit} from "@angular/core";
import {Project} from "../../models/student-report";

@Component({
	selector: "app-projects",
	templateUrl: "./projects.component.html",
	styleUrls: ["./projects.component.scss"]
})
export class ProjectsComponent implements OnInit {
	@Input() projects: Project[] = [];

	constructor() { }

	ngOnInit(): void {
	}

}
