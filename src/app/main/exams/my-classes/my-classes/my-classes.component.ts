import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-my-classes",
	templateUrl: "./my-classes.component.html",
	styleUrls: ["./my-classes.component.scss"]
})
export class MyClassesComponent implements OnInit {

	exams!: any;
	data!: any;
	selectedExam: any = "";
	isLoading = false;
	isLoadingClassData = false;
	constructor(
		private examService: ExamService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private route: ActivatedRoute,
		private router: Router,
	) { }

	ngOnInit(): void {
		// this.exams = this.examService.getMyClassesExams();
		// this.data = this.examService.getMyClassesData();
		this.loadGetMyClassesExams();

	}

	loadGetMyClassesExams(): void {
		this.isLoading = true;
		this.examService.getMyClassesExams().subscribe(
			(res) => {
				this.exams = res;
				if (this.exams != null && this.exams.exams != undefined && this.exams.exams != null && this.exams.exams.length > 0) {

					this.loadGetMyClassesData(this.exams.exams[res.exams.length - 1].examid);
				}
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}, () => {
				this.isLoading = false;
			}
		);
	}

	loadGetMyClassesData(seriesId: any): void {
		this.isLoadingClassData = true;
		this.examService.getMyClassesData(seriesId).subscribe(
			(res) => {
				// console.warn("loadGetMyClassesData >> ", res);
				this.data = res;
				this.formatData();

			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}, () => {
				this.isLoadingClassData = false;
			}
		);
	}

	formatData() {
		const grouped_data: any[] = [];
		const terms: any = [];
		for (let i = 0; i < this.exams.exams.length; i++) {
			const exam = this.exams.exams[i];
			if (terms.indexOf(exam.term) == -1) {
				terms.push(exam.term);
			}
		}

		// console.log(terms);

		for (let j = 0; j < terms.length; j++) {
			const t = terms[j];
			let e_data: any[] = [];
			for (let k = 0; k < this.exams.exams.length; k++) {
				const e = this.exams.exams[k];
				//  console.log(e);
				if (e.term === t) {
					e_data.push(e);
				}
			}
			grouped_data.push({
				term: t,
				examList: e_data
			});
			e_data = [];
		}
		this.exams.formatData = grouped_data;
		this.selectedExam = (this.selectedExam == "") ? this.exams.exams[this.exams.exams.length - 1].seriesid : this.selectedExam;
	}

	onExamChange() {
		const e = this.selectedExam;

		this.examService.getMyClassesData(e).subscribe(
			(res) => {
				this.data = res;
			}, (err) => {
				const message = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toastService.error(message);
			}
		);
	}

	go_to_upload_results(c: any) {
		const classId = c.classid;
		const lock = 1;
		const seriesId = parseInt(this.selectedExam);
		console.warn(classId, lock, seriesId);
		this.router.navigateByUrl(
			`main/exams/my-classes/upload/results/subject/${classId}/${seriesId}/${lock}`
		);

	}
	uploadResults(c: any) {
		if (c.upload_require_unpublish) {
			Swal.fire({
				title: this.translate.instant("exams.myClasses.swal.title"),
				text: this.translate.instant("exams.myClasses.swal.text"),
				icon: "warning",
				showCancelButton: true,
				confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
			}).then((isConfirm) => {
				if (isConfirm.isConfirmed) {
					this.unpublishToAllowMarksEntry(c);
				}
			}
			);
		} else {
			this.go_to_upload_results(c);
		}
	}

	unpublishToAllowMarksEntry(c: any) {
		const url = "/results/series/unpublish/resultsentry/" + parseInt(this.selectedExam) + "/-1" + "?streamid=" + c.streamid;
		this.examService.doPostNoParams(url).subscribe((res) => {
			this.go_to_upload_results(c);
		}, (err) => {
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}

}
