import { Component, Input } from "@angular/core";
import { AggregateStatistics } from "../../../../../@core/models/printouts/report-forms/aggregate-statistics";
import { SchoolTypes } from "../../../../../@core/enums/school-types";

@Component({
	selector: "app-aggregate-statistics",
	templateUrl: "./aggregate-statistics.component.html",
	styleUrls: ["./aggregate-statistics.component.scss"]
})
export class AggregateStatisticsComponent {
	@Input() aggregateStatistics!: AggregateStatistics;
	@Input() majorTextCode?: string;

	schoolTypes = SchoolTypes;

	constructor() { }

}
