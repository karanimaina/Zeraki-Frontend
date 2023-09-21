import { Component, Input, OnDestroy, OnInit } from "@angular/core";

@Component({
	selector: "app-school-metrics",
	templateUrl: "./school-metrics.component.html",
	styleUrls: ["./school-metrics.component.scss"],
})
export class SchoolMetricsComponent implements OnInit, OnDestroy {
	@Input() isLoading = false;
	@Input() schoolMetrics?: { [key: string]: any };

	constructor() {}

	ngOnInit(): void {}

	ngOnDestroy() {}

	returnZero = (): number => 0;
}
