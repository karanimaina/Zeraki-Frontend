/* eslint-disable indent */
/* eslint-disable no-mixed-spaces-and-tabs */
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges,} from "@angular/core";
import * as Highcharts from "highcharts";
import {Observable} from "rxjs";
import {Major} from "src/app/@core/models/major/major";
import {Role} from "src/app/@core/models/Role";
import {DataService} from "../../../../@core/shared/services/data/data.service";
import {SchoolTypeData} from "../../../../@core/models/school-type-data";

@Component({
	selector: "app-analytics-guinea-top-view",
	templateUrl: "./analytics-guinea-top-view.component.html",
	styleUrls: ["./analytics-guinea-top-view.component.scss"],
})
export class AnalyticsGuineaTopViewComponent implements OnInit, OnChanges {
	highcharts = Highcharts;
	chartOptions: Highcharts.Options = {
		chart: {
			type: "Column",
		},
		colors: ["#43ab49", "#2ea5de", "#343a40"],
		title: {
			text: "",
		},
		subtitle: {
			text: "",
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
				text: null,
			},
		},
		yAxis: {
			labels: {
				overflow: "justify",
			},
			title: {
				text: "",
			},
			min: 0,
			max: 24,
			tickInterval: 4,
		},
		plotOptions: {
			column: {
				dataLabels: {
					enabled: false,
				},
				maxPointWidth: 55,
			},
		},
		credits: {
			enabled: false,
		},
	};

	isHighcharts = typeof Highcharts === "object";
	schoolTypeData?: SchoolTypeData;
	@Input() classData: any;
	@Input() majors!: Major[];
	@Input() streams_performances: any;
	@Input() guinea_graphData: any;
	@Input() selected_exam: any;
	@Input() selected_major: any;
	@Input() selected_stream: any;
	@Input() isSubjectAnalysis = false;
	@Input() subject = "";
	@Input() userRoles$!: Observable<Role>;
	@Input() isLoadingData!: boolean;
	@Input() fetchDataCount!: number;


	@Output() changeSelectedExamEvt: EventEmitter<any> = new EventEmitter();
	@Output() changeSelectedMajorEvt: EventEmitter<any> = new EventEmitter();
	@Output() changeSelectedStreamEvt: EventEmitter<any> = new EventEmitter();
	@Output() viewReportFormEvt: EventEmitter<any> = new EventEmitter();
	@Output() viewMeritListEvt: EventEmitter<any> = new EventEmitter();
	@Output() mostImprovedEvt: EventEmitter<any> = new EventEmitter();
	@Output() getAllStudentsEvt: EventEmitter<any> = new EventEmitter();

	updateFlag = false;

	constructor(private _dataService: DataService) {
		/* */
	}

	ngOnInit(): void {
		this._dataService.schoolData.subscribe((schoolTypeData: SchoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
		// this.chartOptions["series"] = this.guinea_graphData?.graphData;
		// this.chartOptions.xAxis = { categories: this.guinea_graphData?.labels };
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.guinea_graphData) {
			this.chartOptions["series"] = this.guinea_graphData?.graphData;
			this.chartOptions.yAxis = {
				labels: {
					overflow: "justify",
				},
				title: {
					text: "",
				},
				min: this.guinea_graphData.min,
				max: this.guinea_graphData.max,
				tickInterval: 4,
			};
			this.chartOptions.xAxis = {categories: this.guinea_graphData?.labels};
			this.updateFlag = true;
		}
	}

	change_selected_stream() {
		this.changeSelectedStreamEvt.emit(this.selected_stream);
	}

	change_selected_major() {
		this.changeSelectedMajorEvt.emit(this.selected_major);
	}

	change_selected_exam() {
		this.changeSelectedExamEvt.emit(this.selected_exam);
	}

	viewReportForm(x: any) {
		this.viewReportFormEvt.emit(x);
	}

	viewMeritList() {
		this.viewMeritListEvt.emit(false);
	}

	mostImproved() {
		this.mostImprovedEvt.emit();
	}

	getAllStudents() {
		this.getAllStudentsEvt.emit();
	}
}
