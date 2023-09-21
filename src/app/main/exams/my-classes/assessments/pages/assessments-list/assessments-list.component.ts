import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { AssessmentStatus } from "src/app/@core/enums/assessments/assessment-status";
import { Role } from "src/app/@core/models/Role";
import { AssessmentExamResponse } from "src/app/@core/models/assessments/assessment-reponse";
import { AssessmentResponse } from "src/app/@core/models/assessments/assessment-reponse";
import { AssessmentUpdatePayload } from "src/app/@core/models/assessments/payload";
import { AcademicYearShort } from "src/app/@core/models/common/academic-year";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { AssessmentsService } from "src/app/@core/services/exams/assessments/assessments.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import Swal from "sweetalert2";

@Component({
	templateUrl: "./assessments-list.component.html",
	styleUrls: ["./assessments-list.component.scss"]
})
export class AssessmentsListComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<void>();
	readonly AssessmentStatus = AssessmentStatus;

	routeParams: any;
	schoolTypeData?: SchoolTypeData;
	userRoles?: Role;

	isLoadingAssessments = false;
	assessment?: AssessmentResponse;

	academicYears: AcademicYearShort[] = [];
	terms: any[] = [];

	academicYearForm = this.fb.group({
		selectedYear: ["", Validators.required]
	});

	isLoadingAssessmentList = false;

	assessmentToEdit: AssessmentExamResponse | null = null;
	newAssessmentName?: string;

	constructor(
		private assesmentsService: AssessmentsService,
		private dataService: DataService,
		private rolesService: RolesService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
		private fb: FormBuilder,
		private route: ActivatedRoute,
	) { }

	ngOnInit(): void {
		this.getRouteParams();
		this.getUserRoles();
		this.getSchoolTypeData();
	}

	private getRouteParams() {
		this.route.params.subscribe((params) => {
			this.routeParams = params;

			this.getAssessments(this.routeParams["classId"]);
		});
	}

	private getSchoolTypeData() {
		this.dataService.schoolData.subscribe({
			next: (schoolTypeData) => this.schoolTypeData = schoolTypeData,
		});
	}

	private getUserRoles(): void {
		this.rolesService.roleSubject.subscribe(
			userRoles => {
				this.userRoles = userRoles;
			}
		);
	}

	private getAssessments(classId: number, academicYearId?: number, year?: string, loadAssessmentListOnly = false) {
		this.isLoadingAssessments = !loadAssessmentListOnly;
		this.isLoadingAssessmentList = loadAssessmentListOnly;

		this.assesmentsService.getAssessments(classId, academicYearId, year)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => {
					this.isLoadingAssessments = false;
					this.isLoadingAssessmentList = false;
				}),
			)
			.subscribe({
				next: (resp) => {
					this.assessment = resp;
					this.academicYears = this.assessment?.academic_years ?? [];
					this.terms = this.assessment?.terms ?? [];
				},
				error: (err) => this.responseHandler.error(err, "getAssessments()"),
				complete: () => {
					this.academicYearForm.patchValue({
						selectedYear: this.assessment?.ayid
					});
				}
			});
	}

	get selectedYear() {
		return this.academicYearForm.get("selectedYear");
	}

	onAcademicYearChange(year: AcademicYearShort) {
		this.getAssessments(this.routeParams["classId"], year.ayid, year.name, true);
	}

	onAssessmentCreationSuccess(year: AcademicYearShort) {
		this.getAssessments(this.routeParams["classId"], year.ayid, year.name, true);
	}

	async assessmentDeletionConfirmation(assessmentId: number, name: string, index: number) {
		const isConfirm = await Swal.fire({
			title: this.translate.instant("exams.assessments.swal.delete.title"),
			text: this.translate.instant("exams.assessments.swal.delete.text", { name }),
			icon: "warning",
			showCancelButton: true
		});

		if (isConfirm.isConfirmed) this.deleteAssessment(assessmentId, index);
	}

	isDeletingAssessment = false;
	assessmentIdToDelete?: number;

	private deleteAssessment(assessmentId: number, index: number) {
		this.assessmentIdToDelete = assessmentId;
		this.isDeletingAssessment = true;

		this.assesmentsService.deleteAssessment(assessmentId)
			.pipe(takeUntil(this.destroy$), finalize(() => this.isDeletingAssessment = false))
			.subscribe({
				next: (resp) => {
					this.responseHandler.success(resp, "deleteAssessment()");
					this.getAssessments(this.routeParams["classId"], this.selectedYear?.value, undefined, true);
				},
				error: (err) => this.responseHandler.error(err, "deleteAssessment()"),
			});
	}

	async assessmentUnpublishConfirmation(assessmentId: number, name: string) {
		const isConfirm = await Swal.fire({
			title: this.translate.instant("exams.assessments.swal.unpublish.title"),
			text: this.translate.instant("exams.assessments.swal.unpublish.text", { name }),
			icon: "warning",
			showCancelButton: true
		});

		if (isConfirm.isConfirmed) this.unpublishAssessment(assessmentId);
	}

	isUnpublishingAssessment = false;
	assessmentIdToUnpublish?: number;

	private unpublishAssessment(assessmentId: number) {
		this.assessmentIdToUnpublish = assessmentId;
		this.isUnpublishingAssessment = true;

		this.assesmentsService.unpublishAssessment(assessmentId)
			.pipe(takeUntil(this.destroy$), finalize(() => this.isUnpublishingAssessment = false))
			.subscribe({
				next: (resp) => {
					this.responseHandler.success(resp, "unpublishAssessment()");
					this.getAssessments(this.routeParams["classId"], this.selectedYear?.value, undefined, true);
				},
				error: (err) => this.responseHandler.error(err, "unpublishAssessment()"),
			});
	}

	initAssessmentEdit(assessment: AssessmentExamResponse) {
		this.assessmentToEdit  = assessment;
		this.newAssessmentName = this.assessmentToEdit.name;
	}

	cancelAssessmentEdit() {
		this.assessmentToEdit  = null;
	}

	isUpdatingAssessment = false;

	updateAssessment() {
		if (this.newAssessmentName === this.assessmentToEdit?.name) {
			this.assessmentToEdit = null;
			return;
		}

		const payload: AssessmentUpdatePayload = {
			interrogationId: Number(this.assessmentToEdit?.interrogationId),
			name: <string>this.newAssessmentName,
		};

		this.isUpdatingAssessment = true;

		this.assesmentsService.updateAssessment(payload)
			.pipe(takeUntil(this.destroy$), finalize(() => this.isUpdatingAssessment = false))
			.subscribe({
				next: (resp) => {
					this.assessmentToEdit!.name = <string>this.newAssessmentName;
					this.responseHandler.success(resp, "updateAssessment()");
					this.assessmentToEdit = null;
				},
				error: (err) => this.responseHandler.error(err, "updateAssessment()"),
			});
	}

	ngOnDestroy(): void {
		this.destroy$.next();
		this.destroy$.complete();
	}

}
