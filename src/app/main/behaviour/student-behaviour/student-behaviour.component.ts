import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Chart } from "angular-highcharts";
import { BehaviourService } from "src/app/@core/services/behaviour/behaviour.service";
import Swal from "sweetalert2";


@Component({
	selector: "app-student-behaviour",
	templateUrl: "./student-behaviour.component.html",
	styleUrls: ["./student-behaviour.component.scss"]
})
export class StudentBehaviourComponent implements OnInit {

	pathParams: any = {};
	student: any = {};
	recentRecords: any = {};
	awards: any = {};

	viewRecentRecords = true;

	selectedYear: any;
	selectedYearLabel: any;
	selectedTerm: any;
	selectedType: any = 1;
	selectedTerms: any[] = [];
	count = 0;
	classBehaviourTimeline: any;

	chart = new Chart({
		chart: {
			type: "column"
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
		legend: {
			enabled: false
		},
		series: [
			{
				data: [],
				type: "column",
				color: "green"
			}
		]
	});

	constructor(
		private route: ActivatedRoute,
		private toastService: HotToastService,
		private bService: BehaviourService,
		private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.route.params.subscribe(
			(params) => {
				this.pathParams = params;
				this.loadStudent(params.userid);

			}
		);
	}

	loadStudent(studentId: any) {
		this.bService.getStudentBehaviour(studentId).subscribe(
			(res) => {
				this.student = res;
				this.selectedYear = res.behaviour_timeline.most_recent_ayid;
				// this.selectedTerm = res.most_recent_term;

				this.initGraphData();

				this.academicYearChange();
				const page = 0;
				//load recent records
				this.loadRecentRecords(page);
				//load awards
				this.loadAwards(page);

			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	initGraphData() {
		const list = this.student.behaviour_timeline.timeseries;
		const categories: any = [];
		const data: any = [];
		const colors: any = [];
		list.list.forEach((i: any) => {
			categories.push(i.name);
			data.push([i.name, i.value, this.getBehaviourColorByPoints(i.value)]);
		});
		console.log(data);
		this.chart = new Chart({
			chart: {
				type: "column"
			},
			title: {
				text: ""
			},
			credits: {
				enabled: false
			},
			xAxis: {
				categories: categories
			},
			yAxis: {
				min: list.min,
				max: list.max,
				title: {
					text: ""
				}
			},
			legend: {
				enabled: false
			},
			series: [
				{
					data: data,
					type: "column",
					color: "#62cb31"
				}
			]
		});

		this.gaugeFormat = new Chart({
			title: {
				text: ""
			},
			legend: {
				enabled: false
			},
			chart: {
				type: "solidgauge"
			},
			scrollbar: {
				enabled: false
			},
			pane: {
				center: [
					"50%",
					"85%"
				],
				size: "140%",
				startAngle: -90,
				endAngle: 90,
				// background: {
				//   innerRadius: "60%",
				//   outerRadius: "100%",
				//   shape: "arc"
				// }
			},
			"plotOptions": {
				"solidgauge": {
					"dataLabels": {
						"y": 5,
						"borderWidth": 0,
						"useHTML": true
					}
				}
			},
			"tooltip": {
				"enabled": false
			},
			"series": [
				{
					"name": "",
					"type": "gauge",
					"data": [
						this.student.points
					],
					"dial": {
						radius: "72%",
						backgroundColor: "silver",
						borderColor: "white",
						borderWidth: 2,
						baseWidth: 30,
						topWidth: 1,
						baseLength: "80%",
						rearLength: "-81%"
					},
					"dataLabels": {
						"useHTML": true,
						"borderColor": "white",
						"format": "<div style=\"text-align:center;border:0\"><span style=\"font-size:25px;color:black\">{y}</span><br/><span style=\"font-size:12px;color:silver\">Points</span></div>"
					},
					"pivot": {
						"radius": 0
					},
					id: "series-1"
				}
			],
			"yAxis": {
				"plotBands": [
					{
						"from": 20,
						"to": 30,
						"thickness": "40%",
						"color": "#d9534f"
					},
					{
						"from": 30,
						"to": 40,
						"thickness": "40%",
						"color": "#f0ad4e"
					},
					{
						"from": 40,
						"to": 50,
						"thickness": "40%",
						"color": "#62cb31"
					},
					{
						"from": 50,
						"to": 60,
						"thickness": "40%",
						"color": "#3498db"
					}
				],
				"lineWidth": 0,
				"minorTickInterval": 0,
				"tickPixelInterval": 60,
				"tickPosition": "outside",
				"tickLength": 0,
				"min": 20,
				"max": 60,
				"title": {
					"y": -70
				},
				"labels": {
					"distance": 10
				}
			},
			"exporting": {
				"enabled": false
			}
		});
	}

	loadRecentRecords(page: any,) {
		this.bService.getStudentRecentRecords(this.selectedYear, page, this.selectedTerm, this.pathParams.userid).subscribe((res) => {
			this.recentRecords = res;


		}, (err) => {
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}

	loadAwards(page: any) {
		this.bService.getStudentAwards(this.selectedYear, page, this.selectedTerm, this.pathParams.userid).subscribe((res) => {
			this.awards = res;
		}, (err) => {
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}

	academicYearChange() {
		this.student.behaviour_timeline.academic_years.forEach((ayear: any) => {
			if (ayear.ayid == this.selectedYear) {
				this.selectedYearLabel = ayear.name;
				this.selectedTerms = ayear.terms;
				if (this.count == 0) {
					this.selectedTerm = this.student.behaviour_timeline.most_recent_term;
				} else {
					this.selectedTerm = this.selectedTerms[0];
					// this.loadStatistics()
					// //load class recent
					this.loadRecentRecords(0);
					// //load clasStudentPoints
					// this.loadClassStudentPoints(0)
					// //loadClassStudentAwards
					this.loadAwards(0);
				}
				this.count++;
			}
		});
	}

	termChange() {
		this.loadRecentRecords(0);
		this.loadAwards(0);
	}

	toggleView() {
		this.viewRecentRecords = !this.viewRecentRecords;
	}

	deleteBehaviourRecord(record: any, index: any) {
		Swal.fire({
			title: this.translate.instant("behaviour.studentBehaviour.swal.title"),
			text: this.translate.instant("behaviour.studentBehaviour.swal.text"),
			icon: "question",
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			showCancelButton: true
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.bService.deleteRecentRecord(record.recordid).subscribe(
					(res) => {
						console.log(res.message);

						const message = this.translate.instant("behaviour.studentBehaviour.toastMessages.deleteSuccess");
						this.toastService.success(message);

						this.recentRecords.students.splice(index, 1);
					}, (err) => {
						console.log(err.error.message);

						const message = this.translate.instant("behaviour.studentBehaviour.toastMessages.deleteError");
						this.toastService.error(message);
					}
				);
			}
		});
	}
	getBehaviourColorByPoints(points: any): any {
		if (points > 50.0) {
			return "#3498db";
		} else if (points > 40.0) {
			return "#62cb31";
		} else if (points > 30.0) {
			return "#f0ad4e";
		} else {
			return "#d9534f";
		}
	}
	gaugeFormat: Chart = new Chart();


}
