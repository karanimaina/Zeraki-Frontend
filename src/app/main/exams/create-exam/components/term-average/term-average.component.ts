import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {ExamService} from "../../../../../@core/services/exams/exam.service";
import {FormArray, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {HotToastService} from "@ngneat/hot-toast";
import {SchoolTypeData} from "../../../../../@core/models/school-type-data";
import {Router} from "@angular/router";
import {ResponseHandlerService} from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-term-average",
	templateUrl: "./term-average.component.html",
	styleUrls: ["./term-average.component.scss"]
})
export class TermAverageComponent implements OnInit, OnDestroy {
	@Input() schoolTypeData!: SchoolTypeData;
	termAndYearFormGroup!: FormGroup;
	formExamsFormGroup!: FormGroup;
	academicYears: Array<{ ayid: number, name: string }> = [];
	fetchingAcademicYears = true;
	destroy$: Subject<void> = new Subject<void>();
	fetchingExamSeries = false;
	examSeriesResponse: any;
	selectedIntake!: string;
	intakeExams: any[] = [];
	intakeAssignments: any[] = [];
	creatingTermAverage = false;
	private ORDINARY_EXAM = "ORDINARY_EXAM";
	private ASSIGNMENT = "ASSIGNMENT";

	constructor(
		private examService: ExamService,
		private fb: FormBuilder,
		private translate: TranslateService,
		private toastService: HotToastService,
		private responseHandler: ResponseHandlerService,
		private router: Router) {
	}

	private get assignmentIdsFormControl() {
		return <FormArray>this.formExamsFormGroup.get("assignmentIds");
	}

	private get selectedAssignmentIndexes(): number[] {
		return this.assignmentIdsFormControl.value
			.map((isChecked, index) => ({isChecked, index}))
			.filter(({isChecked}) => isChecked == true)
			.map(({index}) => index);
	}

	ngOnInit(): void {
		this.initializeTermAndYearFormGroup();
		this.initializeFormExamsFormGroup();
		this.getAcademicYears();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

	initializeTermAndYearFormGroup() {
		this.termAndYearFormGroup = this.fb.group({
			term: ["", Validators.required],
			academicYearId: ["", Validators.required]
		});

		this.termAndYearFormGroup.valueChanges.subscribe(() => {
			this.examSeriesResponse = null;
		});
	}

	fetchExamSeriesWithoutExamGroups() {
		this.termAndYearFormGroup.markAllAsTouched();
		if (this.termAndYearFormGroup.invalid) {
			return;
		}

		this.fetchingExamSeries = true;
		const {term, academicYearId} = this.termAndYearFormGroup.value;
		this.examService.getSeriesWithoutGroup(term, academicYearId)
			.pipe(takeUntil(this.destroy$))
			.subscribe((res: any) => {
				this.fetchingExamSeries = false;
				this.examSeriesResponse = res;
				if (!res.examsfound) {
					const errorMsg = this.translate.instant("exams.consolidatedExams.toastMessages.topErrorMsg");
					this.toastService.error(errorMsg);
				}
			}, () => {
				this.fetchingExamSeries = false;
			});
	}

	createTermAverageExam() {
		let termAveragePayload: any = {};

		this.formExamsFormGroup.markAllAsTouched();
		if (this.formExamsFormGroup.invalid) {
			return;
		}

		if (this.schoolTypeData.isGuineaSecondarySchool && this.selectedAssignmentIndexes.length < 3) {
			const errorMsg = this.translate.instant("exams.consolidatedExams.toastMessages.selectThreeAssignments");
			this.toastService.error(errorMsg);
			return;
		}
		if (
			this.schoolTypeData.isIvorianSchool && this.selectedAssignmentIndexes.length < 2) {
			const errorMsg = this.translate.instant("exams.consolidatedExams.toastMessages.selectTwoEvaluations");
			this.toastService.error(errorMsg);
			return;
		}

		if (this.schoolTypeData.isGuineaSecondarySchool && !this.formExamsFormGroup.value.examId) {
			const errorMsg = this.translate.instant("exams.consolidatedExams.toastMessages.selectAssignmentsAndExams");
			this.toastService.error(errorMsg);
			return;
		}

		termAveragePayload = this.getTermAveragePayload();
		if (this.schoolTypeData.isIvorianSchool) {
			termAveragePayload.evaluationIds = termAveragePayload.assignmentIds;
			delete termAveragePayload["assignmentIds"];
		}

		this.creatingTermAverage = true;
		this.examService.createTermAverageExam(termAveragePayload).subscribe(() => {
			const successMsg = this.translate.instant("exams.consolidatedExams.toastMessages.termAverageExamCreated");
			this.toastService.success(successMsg);

			this.creatingTermAverage = false;
			this.router.navigate(["/main/exams/manage"]);
		}, (error) => {
			this.responseHandler.error(error, "createTermAverageExam()");

			this.creatingTermAverage = false;
		});
	}

	private initializeFormExamsFormGroup() {
		this.formExamsFormGroup = this.fb.group({
			intakeId: ["", Validators.required],
			assignmentIds: this.fb.array([]),
			examId: [""],
		});

		this.watchIntakeIdFormControlChanges();
	}

	private watchIntakeIdFormControlChanges() {
		this.formExamsFormGroup.get("intakeId")?.valueChanges.subscribe((intake) => {
			this.selectedIntake = intake;
			this.setExamsAndAssignmentsForIntake();
			this.updateAssignmentIdsFormControl();
		});
	}

	private setExamsAndAssignmentsForIntake() {
		this.intakeExams = this.examSeriesResponse[this.selectedIntake]?.exams?.filter((exam: any) => exam.seriesType == this.ORDINARY_EXAM) || [];// this.ORDINARY_EXAM) || [];
		this.intakeAssignments = this.examSeriesResponse[this.selectedIntake]?.exams?.filter((exam: any) => exam.seriesType !== this.ORDINARY_EXAM) || [];//this.ASSIGNMENT) || [];
	}

	private updateAssignmentIdsFormControl() {
		this.assignmentIdsFormControl.clear();
		this.intakeAssignments?.forEach(() => this.assignmentIdsFormControl.push(this.fb.control(false)));
	}

	private getAcademicYears() {
		this.examService.getAcademicYears()
			.pipe(takeUntil(this.destroy$))
			.subscribe((res: any) => {
				this.academicYears = res;
				this.fetchingAcademicYears = false;
			}, () => {
				this.fetchingAcademicYears = false;
			});
	}

	private getTermAveragePayload() {
		const assignmentIds = this.intakeAssignments
			.map((assignment, index) => this.selectedAssignmentIndexes.includes(index) ? assignment.seriesid : null)
			.filter((id) => id != null);

		const termAveragePayload = {
			intakeId: this.examSeriesResponse[this.selectedIntake].intakeid,
			academicYearId: this.termAndYearFormGroup.value.academicYearId,
			term: this.termAndYearFormGroup.value.term,
			assignmentIds
		};
		if (this.schoolTypeData.isGuineaSecondarySchool) {
			termAveragePayload["examId"] = this.formExamsFormGroup.value.examId;
		}
		return termAveragePayload;
	}
}
