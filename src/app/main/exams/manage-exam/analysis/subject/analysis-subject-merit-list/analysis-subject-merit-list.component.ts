import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import {SchoolTypeData} from "../../../../../../@core/models/school-type-data";

export interface StudentList {
	admno: string
	grade: string
	name: string
	score: number
	stream: string
	userid: number
}

@Component({
	selector: "app-analysis-subject-merit-list",
	templateUrl: "./analysis-subject-merit-list.component.html",
	styleUrls: ["./analysis-subject-merit-list.component.scss"]
})
export class AnalysisSubjectMeritListComponent implements OnInit {

	pathParams: any;
	url = "";
	data: any = {};
	count: any;
	pages: any;
	page: any;
	totalStudents: any;
	schoolTypeData!: SchoolTypeData;

	constructor(
		private examService: ExamService,
		private errorHandler: ResponseHandlerService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private dataService: DataService
	) { }

	ngOnInit(): void {
		this.loadSchoolProfile();
		this.activatedRoute.params.subscribe((p: any) => {
			this.pathParams = p;
			console.warn("this.pathParams >> ", this.pathParams);
			this.initData();
		});
	}
	loadSchoolProfile() {
		this.dataService.schoolData.subscribe(
			(schoolTypeData) => {
				this.schoolTypeData = schoolTypeData;
			}
		);
	}

	initData() {
		let url = "analytics/subject/meritlist?";
		const p = this.pathParams;
		if (p.seriesid > 0) {
			url += "&seriesid=" + p.seriesid;
		}
		if (p.egroupid > 0) {
			url += "&egroupid=" + p.egroupid;
		}
		if (p.subjectid > 0) {
			url += "&subjectid=" + p.subjectid;
		}
		if (p.intakeid > 0) {
			url += "&intakeid=" + p.intakeid;
		}
		if (p.classid > 0) {
			url += "&classid=" + p.classid;
		}

		this.url = url;


		this.loadData(0);
	}
	loadData(page: any) {
		const params = "&page=" + page + "&all=false";
		this.dataService.get(this.url + params).subscribe(
			(res) => {
				this.data = res;
				this.count = page * 20;
				this.page = page;
				this.pages = Math.ceil(this.data.total / 20);
				if (page == 0) {
					this.totalStudents = this.data.total;
				}
			}
		);
		// liteService.get(url + params).then(function (resp) {

		//   $window.scrollTo(0, 0);
		// });
	}

	goStudentAnalytics(d: StudentList) {
		this.router.navigate(["main/students/analytics", d.userid]);
	}

	exportToExcel() {
		// this.printoutsService.getExcel_A_reports(this.url + "&all=true").subscribe(resp => {
		//   this.toastService.success('Success');
		// });
		this.dataService.get(this.url + "&all=true").subscribe(
			(res: any) => {
				console.warn("res >> ", res);
				const name = this.schoolTypeData.formoryear + " " + res.form + " - " + res.subject + "-" + res.exam_name;

				let countryGradeKey: "grade" | "mention" | "achievementLevel" = "grade";
				if (this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool) {
					countryGradeKey = "mention";
				} else if (this.schoolTypeData?.isSouthAfricaPrimarySchool || this.schoolTypeData?.isSouthAfricaSecondarySchool) {
					countryGradeKey = "achievementLevel";
				}

				if (res.list) this.examService.exportSubjectMarksToExcel2(res.list, name, countryGradeKey);
			}, (err) => {
				this.errorHandler.error(err, "exportToExcel()");
			}
		);
	}

	navigatePage(text: any) {
		let page = this.page;
		if (text == "next") {
			page++;
			if (page <= this.pages) {
				this.loadData(page);
			}
		} else {
			page--;
			if (page >= 0) {
				this.loadData(page);
			}
		}

	}

}
