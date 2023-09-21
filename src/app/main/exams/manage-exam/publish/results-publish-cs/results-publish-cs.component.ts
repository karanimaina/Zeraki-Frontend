import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, of, Subscription } from "rxjs";
import { catchError } from "rxjs/operators";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-results-publish-cs",
	templateUrl: "./results-publish-cs.component.html",
	styleUrls: ["./results-publish-cs.component.scss"]
})
export class ResultsPublishCsComponent implements OnInit, OnDestroy {

	examsToPublish_Admin: any = undefined;
	examsToPublish: any;
	intakeInfo: any;
	classInfo: any;
	params: any;
	lock_exam?: boolean;
	viewonly?: boolean;
	viewonly_int?: number;
	exam: any;
	showLoading = true;
	isLoadingExams = true;
	publish_success_status = false;
	publish_title?: string;
	publish_msg?: string;
	error_exam = false;
	error_msg = "";
	schooldata?: SchoolTypeData;

	schooldataSub?: Subscription;

	constructor(
		private examService: ExamService,
		private dataService: DataService,
		private classesService: ClassesService,
		private translate: TranslateService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		public _location: Location) { }


	ngOnDestroy(): void {
		this.schooldataSub?.unsubscribe();
	}

	ngOnInit(): void {
		this.schooldataSub = this.dataService.schoolData.subscribe(resp => {
			this.schooldata = resp;
		});

		this.activatedRoute.params.subscribe(params => {
			// console.warn("Params >> ", params);
			this.params = params;
			if (params.seriesid > 0 && params.lock == 1) {
				forkJoin([
					this.examService.getResultstoPublishClassSupervisor(params.intakeid).pipe(catchError(e => of(e))),
					this.classesService.getBasicDetailsIntake(params.intakeid).pipe(catchError(e => of(e))),
					this.examService.getResultstoPublishClassSupervisor(params.intakeid, params.seriesid).pipe(catchError(e => of(e)))
				]).subscribe(([examsToPublish, intakeInfo, examsToPublish_Admin]) => {
					this.examsToPublish_Admin = examsToPublish_Admin;
					this.examsToPublish = examsToPublish;
					this.intakeInfo = intakeInfo;
					this.controller();
				});
			} else {
				forkJoin([
					this.examService.getResultstoPublishClassSupervisor(params.intakeid).pipe(catchError(e => of(e))),
					this.classesService.getBasicDetailsIntake(params.intakeid).pipe(catchError(e => of(e)))
				]).subscribe(([examsToPublish, intakeInfo]) => {
					this.examsToPublish = examsToPublish;
					this.intakeInfo = intakeInfo;
					this.controller();
				});
			}
		});
	}

	controller() {
		this.examsToPublish = this.examsToPublish.list;
		this.classInfo = this.intakeInfo;
		if (this.params.seriesid > 0 && this.params.lock == 1) {
			if (this.examsToPublish_Admin != undefined && this.examsToPublish_Admin != null && this.examsToPublish_Admin.list != null) {
				this.examsToPublish = this.examsToPublish_Admin.list;
			}
		}

		this.lock_exam = false;
		if (this.params.lock != null && this.params.lock == 1 && this.params.seriesid != null && this.params.seriesid.length > 0) {
			this.lock_exam = true;
		}

		this.viewonly = false;
		this.viewonly_int = 0;
		if (this.params.viewonly != null && this.params.viewonly == 1) {
			this.viewonly = true;
			this.viewonly_int = 1;
		}

		let stateparams_seriesid_found = false;
		if (this.examsToPublish !== undefined && this.examsToPublish.length > 0) {
			this.exam = this.examsToPublish[0];
			this.examsToPublish.forEach(exam => {
				if (exam.examid == this.params.seriesid) {
					this.exam = exam;
					stateparams_seriesid_found = true;
				}
			});
			if (!stateparams_seriesid_found) {
				this.onExamChange();
			}
		}
		this.initBoolean();
		this.isLoadingExams = false;
	}

	onExamChange() {
		// if (this.exam != null && this.exam.examid != null) {
		// 	$state.go($state.current, { intakeid: this.params.intakeid, seriesid: this.exam.examid }, {
		// 		notify: false, reload: false, location: "replace", inherit: true
		// 	});
		// }
	}

	publishSeries() {
		this.initBoolean();
		this.translate.get(["exams.publishCs.swal1.title", "exams.publishCs.swal1.text"])
			.subscribe(translations => {
				Swal.fire({
					title: translations["exams.publishCs.swal1.title"],
					text: translations["exams.publishCs.swal1.text"],
					icon: "warning",
					showCancelButton: true,
					confirmButtonText: "OK"
				}).then((result) => {
					if (result.isConfirmed) {
						this.showLoading = true;
						this.dataService.putnoParams("/results/publish/classsupervisor/" + this.exam.examid + "/-1?intakeid=" + this.params.intakeid).subscribe((resp: any) => {
							console.warn("Resp >> ", resp);
							if (resp.responseCode == 200) {
								this.publish_success_status = true;
								this.translate.get(["exams.publishCs.swal2.title", "exams.publishCs.swal2.text"])
									.subscribe(translations => {
										this.publish_title = translations["exams.publishCs.swal2.title"];
										this.publish_msg = translations["exams.publishCs.swal2.text"];
										Swal.fire({
											title: this.publish_title,
											text: this.publish_msg,
											icon: "success"
										}).then((result) => {
											if (result.isConfirmed) {
												this.router.navigate(["/main/exams/my-classes"]);
											}
										});
									});
							}
						});
					}
				});
			});
	}

	initBoolean() {
		this.publish_success_status = false;
		this.error_exam = false;
		this.error_msg = "";
	}

}
