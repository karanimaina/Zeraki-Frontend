import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { FormGroup, NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable, of, Subject, Subscription } from "rxjs";
import { catchError, takeUntil } from "rxjs/operators";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { MentionService } from "src/app/@core/services/exams/mention/mention.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SchoolTypeCheckerService } from "src/app/@core/shared/services/school/school-type-checker/school-type-checker.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-consolidated-exams",
	templateUrl: "./consolidated-exams.component.html",
	styleUrls: ["./consolidated-exams.component.scss"]
})
export class ConsolidatedExamsComponent implements OnInit, OnDestroy {

	destroy$: Subject<boolean> = new Subject<boolean>();
	@ViewChild("successAlert") successAlert: any;
	@ViewChild("addForm") addForm: any;

	showExams = false;

	createExam: any;
	createExamForm!: FormGroup;

	allForms!: any;
	academicYears!: any;
	terms = [1, 2, 3];
	eGroupExams !: any;

	add_exam_success: any = {};
	error_exam: any;
	error_msg: any;
	forms: any[] = [];
	examtype: any = {};
	descStatus = false;
	exams: any;
	top_error = false;
	top_error_msg = "";

	isFetching = false;
	isSubmitForm = false;
	isGuineaSchool = false;
	mentions!: any;
	selectedMention: any;
	selectedMentionId: any;
	examDesc: any = {};

	schoolTypeData?: SchoolTypeData;
	schoolTypeDataSub?: Subscription;
	isCreatingGuineaTermAverageExam = false;

	constructor(
		private examService: ExamService,
		private mentionsService: MentionService,
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private router: Router,
		private schoolTypeChecker: SchoolTypeCheckerService,
		private errorHandler: ResponseHandlerService
	) { }

	ngOnInit(): void {
		this.getSchoolTypeData();
		this.isGuineaSchool = this.schoolTypeChecker.isGuineaSchool;
		this.examtype.examseries = true;
		this.examtype.egroup = false;
		this.examtype.yearaverage = false;
		this.examtype.kcse = false;
		this.isFetching = true;
		forkJoin([
			this.examService.getAllForms().pipe(catchError(e => of(e))),
			this.examService.getAcademicYears().pipe(catchError(e => of(e)))
		]).subscribe(([forms, academicYears]) => {
			this.forms = forms;
			this.academicYears = academicYears;

			this.controller();
			this.isFetching = false;
		}, () => {
			this.isFetching = false;
		});
		this.initBoolean();
	}

	private getSchoolTypeData() {
		this.schoolTypeDataSub = this.dataService.schoolData.subscribe(schoolTypeData => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	controller() {
		this.setExamType_EGroup(true);
		this.descStatus = false;
	}

	invalidateDesc() {
		this.descStatus = false;
		this.showExams = false;
	}


	showDesc(form: NgForm) {
		if (form.invalid) {
			if (form.controls.name?.errors?.pattern) {
				this.toastService.warning("Invalid exam name");
			}
			return;
		}

		if (form.invalid) return;

		this.initSeriesData();

		this.examDesc = form.value;

		const observable: Observable<any> =
			this.getNonGuineaSeriesExams(form.value.term, form.value.academic_year);

		this.seriesExamsSubscriber(observable);

	}

	initSeriesData() {
		this.forms = [];
		this.top_error = false;
		this.top_error_msg = "";
		this.isSubmitForm = true;
	}

	getNonGuineaSeriesExams(term: number, academicYear: number): Observable<any> {
		return this.examService.getSeriesWithoutGroup(term, academicYear);
	}


	seriesExamsSubscriber(observable: Observable<any>) {
		observable.subscribe({
			next: resp => {
				this.exams = resp;
				this.forms = this.exams.forms;
				if (this.exams.examsfound) {
					this.forms.forEach(form => {
						if (this.exams[form]) {
							this.exams[form].maxratio = 0;
							this.exams[form].exams.forEach(exam => {
								exam.selected = this.isGuineaSchool || this.schoolTypeData?.isIvorianSchool;
								exam.ratio = 1;
							});
							const f: any = {};
							f.form = form;
							f.intakeid = this.exams[form].intakeid;
							f.selected = false;
							this.showExams = true;
							this.forms.push(f);
						}
					});
					this.descStatus = true;
				} else {
					this.top_error = true;
					const errorMsg = this.translate.instant("exams.consolidatedExams.toastMessages.topErrorMsg");
					this.top_error_msg = errorMsg;
					this.toastService.error(this.top_error_msg);
				}
				this.isSubmitForm = false;
			},
			error: err => {
				this.errorHandler.error(err, "seriesExamsSubscriber()");
				this.isSubmitForm = false;
			}
		});
	}

	setExamType_EGroup(et_egroup: boolean) {
		if (et_egroup) {
			this.examtype.egroup = true;
			this.examtype.examseries = false;
			this.examtype.yearaverage = false;
			this.examtype.kcse = false;
		}
	}

	onExamsChange(form: any) {
		let selected = 0;
		this.exams[form].exams.forEach(exam => {
			if (exam.selected) {
				selected = selected + 1;
			}
		});
		this.exams[form].maxratio = selected;
	}

	onFormsChange(index: any) {
		if (!this.forms[index].selected) {
			const form = this.forms[index].form;
			this.exams[form].maxratio = 0;
			this.exams[form].exams.forEach(exam => {
				exam.selected = false;
				exam.ratio = 1;
			});
		}
	}

	createGuineaGroup(form: NgForm) {
		if (form.invalid) return;

		const gradeIndex = parseInt(form.value.grade);

		//create the variables for api query params
		const intakeid = this.forms[gradeIndex].intakeid;
		const term = this.examDesc.term;
		// const ayid = this.academicYears[parseInt(this.examDesc.academic_year)].ayid;
		const ayid = this.examDesc.academic_year;
		//set variables for body

		Swal.fire({
			title: this.translate.instant("exams.kcseExams.swal.title"),
			text: this.translate.instant("exams.kcseExams.swal.text"),
			icon: "question",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("exams.addIntake.createBtn"),
			cancelButtonText: this.translate.instant("exams.addIntake.cancelBtn")
		}).then((response) => {
			if (response.isConfirmed) {
				this.addGuineaTermAverage(intakeid, ayid, term);
			}
		});


	}

	addGuineaTermAverage(intakeid: any, ayid: any, term: any) {
		this.isCreatingGuineaTermAverageExam = true;
		this.examService.addGuineaTermAverage(intakeid, ayid, term).pipe(takeUntil(this.destroy$)).subscribe({
			next: resp => {
				this.isCreateExamSuccess();
				this.isCreatingGuineaTermAverageExam = false;
			},
			error: err => {
				this.isCreatingGuineaTermAverageExam = false;
				this.errorHandler.error(err, "addGuineaTermAverage()");
			}
		});
	}

	isCreateExamSuccess() {
		Swal.fire({
			title: this.translate.instant("exams.yearAverageExams.alertSuccessTitle"),
			text: this.translate.instant("exams.createExam.alertBodyText"),
			icon: "success",
			showCancelButton: false,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextOkay")
		}).then((isConfirm) => {
			this.router.navigateByUrl("/main/exams/manage");
		});
	}

	addGroup() {
		this.initBoolean();
		const selected_forms: any[] = [];
		this.forms.forEach(form => {
			if (form.selected) {
				const maxratio = this.exams[form.form].maxratio;
				const selectedexams: any[] = [];
				this.exams[form.form].exams.forEach(exam => {
					if (exam.selected) {
						if (exam.ratio === undefined || !(exam.ratio > 0)) {
							this.error_exam = true;
							const errorMsg = this.translate.instant("exams.consolidatedExams.toastMessages.addGroupForm.incorrectRatio", { examName: exam.name, formOrYear: this.schoolTypeData?.formoryear, form: form.form });
							this.error_msg = errorMsg;
							// this.error_msg = "Please specify a correct ratio for " + exam.name + " in " + this.formOrYear + form.form;
							this.toastService.error(this.error_msg);
						}
						const selected_exam = { seriesid: exam.seriesid, ratio: exam.ratio };
						selectedexams.push(selected_exam);
					}
				});
				if (maxratio >= 1) {
					this.addForm.value.name = this.addForm.value.name.trim();
					const selected_form = JSON.parse(JSON.stringify(this.addForm.value));
					//selected_form.form = form.form;
					selected_form.intakeid = form.intakeid;
					selected_form.exams = selectedexams;
					selected_form.academic_year = parseInt(selected_form.academic_year);
					selected_form.term = parseInt(selected_form.term);
					selected_forms.push(selected_form);
				} else {
					this.error_exam = true;
					const errorMsg = this.translate.instant("exams.consolidatedExams.toastMessages.addGroupForm.atLeastTwoExamsError", { formOrYear: this.schoolTypeData?.formoryear, form: form.form });
					this.error_msg = errorMsg;
					// this.error_msg = "Please select at least two exams in " + this.schoolTypeData?.formoryear + form.form;
					this.toastService.error(this.error_msg);
				}
			}
		});
		if (!this.error_exam) {
			// this.successAlert.fire();
			if (selected_forms.length > 0) {
				// checking for empty exam name
				if (this.addForm.value.name.trim().length === 0) {
					const examName = this.translate.instant("exams.createExam.labelTextExamName");
					const errorMsg = this.translate.instant("common.toastMessages.formEmptySpaceWarning", { name: examName });
					this.toastService.warning(errorMsg);
					return;
				}

				this.isSubmitForm = true;
				this.examService.addConsolidatedExam(selected_forms).subscribe({
					next: resp => {
						this.addForm.resetForm();
						this.add_exam_success.status = true;
						this.add_exam_success.title = "Consolidated Exam Successfully Created";
						this.add_exam_success.msg = "The Consolidated Exam has been successfully created";
						this.successAlert.fire();
						this.isSubmitForm = false;
					},
					error: err => {
						this.errorHandler.error(err, "addConsolidatedExam()");
						this.isSubmitForm = false;
					}
				});
			} else {
				this.error_exam = true;
				const errorMsg = this.translate.instant("exams.consolidatedExams.toastMessages.addGroupForm.noFormSelected");
				this.error_msg = errorMsg;
				// this.error_msg = "Please select atleast one form";
				this.toastService.error(this.error_msg);
			}
		}
	}

	viewManageExams() {
		this.router.navigateByUrl("/main/exams/manage");
	}

	addAnotherExamGroup() {
		this.initBoolean();
	}

	initBoolean() {
		this.add_exam_success.status = false;
		this.add_exam_success.title = "";
		this.add_exam_success.msg = "";
		this.error_exam = false;
		this.error_msg = "";
	}

	loadGradeMapping() {
		this.mentionsService.getMentionsMapping().pipe(takeUntil(this.destroy$)).subscribe(
			(res) => {
				this.mentions = res;
				if (res && res !== null && Object.keys(res).length > 0) {
					this.selectedMention = (res.length > 0) ? res[0] : null;
					this.selectedMentionId = (res.length > 0) ? res[0].gsid : null;
				}
			}, (err) => {
				this.errorHandler.error(err, "loadGradeMapping()");
			}
		);
	}

	ngOnDestroy(): void {
		this.schoolTypeDataSub?.unsubscribe();
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
