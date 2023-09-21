import {Component, Input, OnInit} from "@angular/core";
import {YearSummaryReport} from "../../../../../@core/models/evaluation/year-summary-report";

@Component({
	selector: "app-year-summary",
	templateUrl: "./year-summary.component.html",
	styleUrls: ["./year-summary.component.scss"]
})
export class YearSummaryComponent implements OnInit {
	@Input() yearSummaryReport: YearSummaryReport[] = [];
	constructor() { }

	ngOnInit(): void {
	}

}
