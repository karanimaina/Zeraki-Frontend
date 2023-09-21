import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { AssessmentAdditionPayload } from "src/app/@core/models/assessments/payload";
import { AcademicYearShort } from "src/app/@core/models/common/academic-year";
import { AssessmentsService } from "src/app/@core/services/exams/assessments/assessments.service";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Component({
	selector: "app-assessment-creation",
	templateUrl: "./assessment-creation.component.html",
	styleUrls: ["./assessment-creation.component.scss"]
})
export class AssessmentCreationComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<void>();

	@Input() classId?: number;
	@Output() onAssessmentCreationSuccess = new EventEmitter<AcademicYearShort>();

	isLoadingAssessmentTypes = false;
	assessmentTypes: string[] = [];

	isLoadingAcademicYears = false;
	academicYears: string[] = [];

	isAddingAssessment = false;

	additionForm = this.fb.group({
		name: ["", Validators.required],
		term: [null, Validators.required],
		year: ["", Validators.required],
		type: ["", Validators.required],
	});

	get name(): AbstractControl | null {
		return this.additionForm.get("name");
	}
	get term(): AbstractControl | null {
		return this.additionForm.get("term");
	}
	get year(): AbstractControl | null {
		return this.additionForm.get("year");
	}
	get type(): AbstractControl | null {
		return this.additionForm.get("type");
	}

	constructor(
		private fb: FormBuilder,
		private responseHandler: ResponseHandlerService,
		private assessmentsService: AssessmentsService,
		private examService: ExamService,
	) { }

	ngOnInit(): void {
	}

	initializeAdditionForm() {
		this.resetAdditionForm();
		this.getAssessmentTypes();
		this.getAcademicYears();
	}

	private resetAdditionForm() {
		this.additionForm.reset();
	}

	private getAssessmentTypes() {
		if (this.assessmentTypes.length > 0) return;

		this.isLoadingAssessmentTypes = true;

		this.assessmentsService.getAssessmentTypes()
			.pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingAssessmentTypes = false))
			.subscribe({
				next: (resp) => this.assessmentTypes = resp,
				error: (err) => this.responseHandler.error(err, "getAssessmentTypes()")
			});
	}

	private getAcademicYears() {
		if (this.academicYears.length > 0) return;

		this.isLoadingAcademicYears = true;

		this.examService.getAcademicYears()
			.pipe(takeUntil(this.destroy$), finalize(() => this.isLoadingAcademicYears = false))
			.subscribe({
				next: (resp) => this.academicYears = resp,
			});
	}

	addAssessment() {
		this.additionForm.markAllAsTouched();
		if (this.additionForm.invalid) return;

		const payload: AssessmentAdditionPayload = {
			name: this.name?.value,
			term: Number(this.term?.value),
			year: Number(this.year?.value?.name),
			type: this.type?.value,
			classId: Number(this.classId),
		};

		this.isAddingAssessment = true;

		this.assessmentsService.addAssessment(payload)
			.pipe(takeUntil(this.destroy$), finalize(() => this.isAddingAssessment = false))
			.subscribe({
				next: (resp) => {
					this.closeAdditionFormModal();
					this.responseHandler.success(resp, "addAssessment()");
					this.onAssessmentCreationSuccess.emit({ ayid: this.year?.value?.ayid, name: this.year?.value?.name });
				},
				error: (err) => this.responseHandler.error(err, "addAssessment()"),
			});
	}

	closeAdditionFormModal() {
		const modalCloseBtn = document.getElementById("btn-assessment-add-modal");
		modalCloseBtn?.click();
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
		this.closeAdditionFormModal();
	}

}
