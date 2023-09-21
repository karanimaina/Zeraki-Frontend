import { Component, OnInit, OnChanges, Input, SimpleChanges } from "@angular/core";
import * as Highcharts from "highcharts";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "../../../../../../@core/shared/services/data/data.service";

@Component({
	selector: "app-analysis-report-guinea-top-view",
	templateUrl: "./analysis-report-guinea-top-view.component.html",
	styleUrls: ["./analysis-report-guinea-top-view.component.scss"]
})
export class AnalysisReportGuineaTopViewComponent implements OnInit, OnChanges {

	@Input() classData: any;
	@Input() isSubjectAnalysis: any;
	@Input() subject: any;
	@Input() guinea_graphData: any;
	schoolTypeData!: SchoolTypeData;

	highcharts = Highcharts;
	chartOptions: Highcharts.Options = {
		chart: {
			type: "Column",
		},
		title: {
			text: ""
		},
		subtitle: {
			text: ""
		},
		legend: {
			layout: "vertical",
			align: "left",
			verticalAlign: "top",
			x: 250,
			y: 100,
			floating: true,
			borderWidth: 1,
			shadow: true,
			enabled: false,
		},
		xAxis: {
			categories: [],
			title: {
				text: null
			}
		},
		yAxis: {
			labels: {
				overflow: "justify",
			},
			title: {
				text: ""
			},
			min: 0,
			max: 21,
			tickInterval: 4,

		},
		plotOptions: {
			bar: {
				dataLabels: {
					enabled: true,
				}
				, maxPointWidth: 45,
			}
		},
		credits: {
			enabled: false
		},
	};

	constructor(private dataService: DataService) { }

	ngOnInit(): void {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.guinea_graphData) {
			this.chartOptions["series"] = this.guinea_graphData?.graphData;
			this.chartOptions.xAxis = {
				categories: this.guinea_graphData?.labels,
			};
		}
	}

}
