import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import * as Highcharts from "highcharts";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-student-analytics-subject",
	templateUrl: "./student-analytics-subject.component.html",
	styleUrls: ["./student-analytics-subject.component.scss"]
})
export class StudentAnalyticsSubjectComponent implements OnInit {

	private examMean = this.translate.instant("common.examMean");
	routeParams: any;
	isLoading = false;
	routeId: any = "";
	subjectAnalytics: any = {};
	isHighcharts = typeof Highcharts === "object";
	Highcharts: typeof Highcharts = Highcharts;
	highchart_time_series: Highcharts.Options = {
		chart: {
			type: "line"
		},
		title: {
			text: ""
		},
		credits: {
			enabled: false
		},
		xAxis: {
			categories: []
		},
		series: [{
			name: this.examMean,
			type: "line",
			cursor: "pointer",
			showInLegend: false,
			data: []
		}],
		exporting: { enabled: true }
	};

	constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private translate: TranslateService,
	private errorHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		this.route.params.subscribe(p => {
			this.routeParams = p;
			this.routeId = p.userid;
			this.loadSubjectDetails();
		});
	}

	loadSubjectDetails() {
		this.isLoading = true;
		let url: any;
		if (this.routeParams.seriesid != -1) {
			url = `analytics/student/subject?subjectid=${this.routeParams.subjectid}&userid=${this.routeParams.userid}&seriesid=${this.routeParams.seriesid}`;
		} else {
			url = `analytics/student/subject?subjectid=${this.routeParams.subjectid}&userid=${this.routeParams.userid}&egroupid=${this.routeParams.egroupid}`;
		}
		this.dataService.get(url).subscribe(res => {
			this.subjectAnalytics = res;
			const categories: any[] = [];
			const data: any[] = [];
			this.subjectAnalytics.list.forEach((e) => {
				data.push(e.value);
				categories.push(e.name);
			});
			this.highchart_time_series = {
				chart: {
					type: "line",
					height: 350,
				},
				plotOptions: {
					series: { animation: true }
				},
				scrollbar: { enabled: true },
				title: {
					text: ""
				},
				xAxis: {
					type: "category",
					tickmarkPlacement: "on",
					gridLineColor: "rgba(228, 229, 231, 0.60)",
					labels: {
						style: { textOverflow: "none" },
						autoRotation: [-45, -90]
					},
					categories: categories
				},
				yAxis: {
					lineWidth: 1,
					title: {
						text: "",
						align: "high"
					}
				},
				credits: {
					enabled: false
				},
				series: [{
					name: this.examMean,
					type: "line",
					cursor: "pointer",
					showInLegend: false,
					data: data
				}],
				exporting: { enabled: false }
			};
			this.isLoading = false;
		}, err => {
			this.errorHandler.error(err, "loadSubjectDetails()");
			this.isLoading = false;
		});
	}

}
