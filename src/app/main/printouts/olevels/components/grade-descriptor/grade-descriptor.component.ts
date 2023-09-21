import {Component, Input, OnInit} from "@angular/core";
import {OlevelGrade} from "../../models/olevel-grade";

@Component({
	selector: "app-grade-descriptor",
	templateUrl: "./grade-descriptor.component.html",
	styleUrls: ["./grade-descriptor.component.scss"]
})
export class GradeDescriptorComponent implements OnInit {
	@Input() grades: OlevelGrade[] = [];
	constructor() { }

	ngOnInit(): void {
	}

}
