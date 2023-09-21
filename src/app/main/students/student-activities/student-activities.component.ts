import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { Subject, Subscription } from "rxjs";
import { AddExtracurricularActivityPayload } from "src/app/@core/models/student/extracurricular-activity";
import { OlevelTerm } from "src/app/@core/models/olevel/olevel-term";
import { OLEVEL_TERMS } from "src/app/@core/shared/utilities/olevel-terms";
import { ExamService } from "src/app/@core/services/exams/exam.service";
import { switchMap, takeUntil, tap } from "rxjs/operators";
import { OlevelAcademicYear } from "src/app/@core/models/olevel/olevel-academic-year";
import { EvaluationService } from "src/app/@core/services/exams/evaluations/evaluation.service";
import { StudentsService } from "src/app/@core/services/student/students.service";

@Component({
	selector: "app-student-activities",
	templateUrl: "./student-activities.component.html",
	styleUrls: ["./student-activities.component.scss"]
})
export class StudentActivitiesComponent implements OnInit, OnDestroy {
	routeId: any;
	activities_info: any;
	currentYear: any;
	currentActivityYear?: { ayid: number; name: string };
	student: any;
	image_path: any;
	selected_year: any;
	action: any;
	selected_activity: any;
	activity: any = {};
	add_activity_success_status = false;
	add_activity_success_msg = "";
	showLoading = false;
	error_status = false;
	error_msg = "";
	user_roles: any;
	isBackup = false;
	schoolTypeData?: SchoolTypeData;
	schoolTypeDataSub?: Subscription;
	destroyed$: Subject<boolean> = new Subject<boolean>();
	academicYears$!: Subscription;
	academicYears: Array<{ ayid: number, name: string }> = [];
	isLoadingAcademicYears = false;
	readonly OLEVEL_TERMS = [...OLEVEL_TERMS];
	academicTerms: Array<OlevelTerm> = [];
	addExtracurricularActivitySub?: Subscription;
	isAdding = false;
	updateExtracurricularActivitySub?: Subscription;
	deleteExtracurricularActivitySub?: Subscription;
	isUpdating = false;

	addForm = this.fb.group({
		year: [null, Validators.required],
		term: [null, Validators.required],
		type: [null, Validators.required],
		name: ["", Validators.required],
		positionHeld: ["", Validators.required],
		description: ["", Validators.required],
	});

	updateForm = this.fb.group({
		year: ["", Validators.required],
		term: ["", Validators.required],
		type: ["", Validators.required],
		name: ["", Validators.required],
		positionHeld: ["", Validators.required],
		description: ["", Validators.required],
	});

	requiredValidator = Validators.required;

	constructor(
		private studentsService: StudentsService,
		private activatedRoute: ActivatedRoute,
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private examService: ExamService,
		private evaluationService: EvaluationService,
		private rolesService: RolesService,
		private fb: FormBuilder,
	) { }

	ngOnInit(): void {
		this.routeId = this.activatedRoute.snapshot.paramMap.get("id");
		this.isBackup = this.dataService.getIsBackup();

		this.getSchoolTypeData();
		this.getUserRoles();
		this.getAcademicTerms();
		this.getCurrentYearAndAcademicYears();
	}

	private getSchoolTypeData() {
		this.schoolTypeDataSub = this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;

			if (this.schoolTypeData?.isOLevelSchool) {
				this.disableFormFields();
			}
		});
	}

	private disableFormFields() {
		this.nameToAdd?.disable();
		this.positionHeldToAdd?.disable();

		this.nameToUpdate?.disable();
		this.positionHeldToUpdate?.disable();
	}

	getUserRoles() {
		this.rolesService.roleSubject.subscribe(resp => {
			this.user_roles = resp;
		});
	}

	private getAcademicYears() {
		return this.evaluationService.getAcademicYears();
	}

	private getCurrentYearAndAcademicYears() {
		this.isLoadingAcademicYears = true;

		this.academicYears$ = this.examService.getCurrentYear()
			.pipe(
				tap((year) => this.currentYear = year),
				switchMap(() => this.getAcademicYears()),
				takeUntil(this.destroyed$)
			).subscribe(({ academicYears }) => {
				this.setAcademicYears(academicYears);
				this.isLoadingAcademicYears = false;

				this.refreshActivities();
			});
	}

	private setAcademicYears(academicYears: OlevelAcademicYear[]) {
		this.academicYears = academicYears.map(({ academicYearId, beginYear }) => {
			return {
				ayid: academicYearId,
				name: beginYear.toString()
			};
		});

		if (this.academicYears.length > 0) {
			const foundAcademicYear = this.academicYears.find(({ name }) => name == this.currentYear);
			if (foundAcademicYear) {
				this.updateAddFormAcademicYear(foundAcademicYear);
			}
		}

	}

	private setCurrentActivityYear(currentYear: number) {
		const foundActivityYear = this.academicYears.find(({ name }) => name === currentYear.toString());
		this.currentActivityYear = foundActivityYear;
	}

	private updateAddFormAcademicYear(year: { ayid: number; name: string }) {
		this.addForm.patchValue({
			year: year?.ayid,
		});
	}

	private getAcademicTerms() {
		this.academicTerms = this.OLEVEL_TERMS;
	}

	getCurrentYear() {
		this.dataService.getCurrentYear().subscribe(resp => {
			this.currentYear = resp;
		});
	}

	setStudentPhoto() {
		this.image_path = this.dataService.getUserImage();
		if (this.student.url !== null && this.student.url.length > 0) {
			this.image_path = this.dataService.getUserImage(this.student.url);
		}
	}

	loadView() {
		let action;

		if (this.student != undefined && this.student.studentActivities != undefined && this.student.studentActivities.length > 0) {
			this.selected_year = this.student.year;
			action = 3;
		} else {
			action = 1;
		}

		this.toggleAction(action);
	}

	toggleAction(action: any) {
		this.action = action;
		this.initItems();
		this.selected_activity = null;
		this.activity = {};
		this.activity.year = this.currentYear;
	}

	initItems() {
		this.add_activity_success_status = false;
		this.add_activity_success_msg = "";
		this.showLoading = false;
		this.error_status = false;
		this.error_msg = "";
	}

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	get yearToAdd(): AbstractControl | null {
		return this.addForm.get("year");
	}
	get termToAdd(): AbstractControl | null {
		return this.addForm.get("term");
	}
	get typeToAdd(): AbstractControl | null {
		return this.addForm.get("type");
	}
	get nameToAdd(): AbstractControl | null {
		return this.addForm.get("name");
	}
	get positionHeldToAdd(): AbstractControl | null {
		return this.addForm.get("positionHeld");
	}
	get descriptionToAdd(): AbstractControl | null {
		return this.addForm.get("description");
	}

	onAdditionSubmit() {
		const form = this.addForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const payload: AddExtracurricularActivityPayload = {
			activityId: this.typeToAdd?.value,
			academicYearId: this.yearToAdd?.value,
			term: this.termToAdd?.value,
			description: this.descriptionToAdd?.value,
			studentId: this.student.userid,
		};

		if (this.schoolTypeData && !this.schoolTypeData.isOLevelSchool) {
			payload["honors"] = this.positionHeldToAdd?.value;
			payload["name"] = this.nameToAdd?.value;
		}

		this.addExtracurricularActivity(payload);
	}

	private addExtracurricularActivity(payload: AddExtracurricularActivityPayload) {
		this.initItems();
		const text = this.translate.instant("students.activities.swal.text", { name: this.student.name });

		Swal.fire({
			title: this.translate.instant("students.activities.swal.title"),
			text: text,
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
		}).then((result) => {
			if (result.isConfirmed) {
				this.showLoading = true;

				this.isAdding = true;

				this.addExtracurricularActivitySub = this.studentsService.addStudentExtracurricularActivity(payload).subscribe({
					next: () => {
						this.add_activity_success_status = true;
						this.showLoading = false;
						this.selected_year = this.activity.year;

						this.isAdding = false;

						const message = this.translate.instant("students.activities.toastMessages.addSuccess");
						this.toastService.success(message);
					},
					error: (error: any) => {
						console.log(error);

						this.showLoading = false;
						if (error.message !== undefined) {
							this.error_status = true;
							this.error_msg = error.message;
						}

						this.isAdding = false;

						const message = this.translate.instant("students.activities.toastMessages.addError");
						this.toastService.error(message);
					},
					complete: () => {
						this.refreshActivities();
					}
				});
			}
		});
	}

	get yearToUpdate(): AbstractControl | null {
		return this.updateForm.get("year");
	}
	get termToUpdate(): AbstractControl | null {
		return this.updateForm.get("term");
	}
	get typeToUpdate(): AbstractControl | null {
		return this.updateForm.get("type");
	}
	get nameToUpdate(): AbstractControl | null {
		return this.updateForm.get("name");
	}
	get positionHeldToUpdate(): AbstractControl | null {
		return this.updateForm.get("positionHeld");
	}
	get descriptionToUpdate(): AbstractControl | null {
		return this.updateForm.get("description");
	}

	prefillUpdateForm(term: number, activity: any, activityDetails: any) {
		this.updateForm.patchValue({
			year: this.currentActivityYear?.ayid,
			term: term,
			type: activity.activityId,
			name: activityDetails.name,
			positionHeld: activityDetails.honors,
			description: activityDetails.description,
		});
	}

	onUpdateSubmit(activityId: number, id: number) {
		const form = this.updateForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const payload: any = {
			id,
			activityId: this.typeToUpdate?.value,
			academicYearId: this.yearToUpdate?.value,
			term: this.termToUpdate?.value,
			description: this.descriptionToUpdate?.value,
			studentId: this.student.userid,
		};

		if (this.schoolTypeData && !this.schoolTypeData.isOLevelSchool) {
			payload["honors"] = this.positionHeldToUpdate?.value;
			payload["name"] = this.nameToUpdate?.value;
		}

		this.updateExtracurricularActivity(payload);
	}

	private updateExtracurricularActivity(payload: any) {
		this.isUpdating = true;

		this.updateExtracurricularActivitySub = this.studentsService.updateStudentExtracurricularActivity(payload).subscribe({
			next: () => {
				this.isUpdating = false;

				this.refreshActivities();
				this.closeUpdateModal(payload["id"]);

				const successMsg = this.translate.instant("students.activities.toastMessages.updateSuccess");
				this.toastService.success(successMsg);
			},
			error: (err: any) => {
				console.log(err);

				this.isUpdating = false;

				const errorMsg = this.translate.instant("students.activities.toastMessages.updateError");
				this.toastService.error(errorMsg);
			},
		});
	}

	closeUpdateModal(id: number) {
		const modalCloseBtn = document.getElementById(`btn-extra-act-update-modal-${id}`);
		modalCloseBtn?.click();
	}

	async deleteActivityConfirmation(id: any) {
		const swalResult = await Swal.fire({
			title: this.translate.instant("students.activities.swal.title2"),
			text: this.translate.instant("students.activities.swal.text2"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
		});

		if (swalResult.isConfirmed)	this.deleteActivity(id);
	}

	private deleteActivity(id: number) {
		this.deleteExtracurricularActivitySub = this.studentsService.deleteStudentExtracurricularActivity(id).subscribe({
			next: data => {
				const responseData: any = data;
				if (responseData && responseData != null) {
					this.refreshActivities();

					const message = this.translate.instant("students.activities.toastMessages.deleteSuccess");
					this.toastService.success(message);
				}

			},
			error: error => {
				console.error("deleteActivity Error >> ", error);

				const message = this.translate.instant("students.activities.toastMessages.deleteError");
				this.toastService.error(message);
			}
		});
	}

	onAcademicYearChange({ name }) {
		this.setCurrentActivityYear(+name);
		this.refreshActivities();
	}

	refreshActivities() {
		this.studentsService.getStudentExtracurricularActivities(this.routeId, this.currentActivityYear?.ayid).subscribe(resp => {
			this.student = resp;

			if (this.currentActivityYear?.ayid != this.student.year) {
				this.setCurrentActivityYear(this.student.year);
			}

			this.loadView();
		});
	}

	showNewActivityView() {
		this.resetAddForm();
		this.toggleAction(2);
	}

	private resetAddForm() {
		this.addForm.reset({
			year: this.currentActivityYear?.ayid,
		});
	}

	ngOnDestroy(): void {
		this.schoolTypeDataSub?.unsubscribe();
		this.addExtracurricularActivitySub?.unsubscribe();
		this.updateExtracurricularActivitySub?.unsubscribe();
		this.deleteExtracurricularActivitySub?.unsubscribe();
		this.destroyed$.next(true);
		this.destroyed$.unsubscribe();
	}

}
