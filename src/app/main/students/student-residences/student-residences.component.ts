import { Component, OnDestroy, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import {
	AddStudentResidencePayload,
	ResidenceTeacher,
	UpdateStudentResidencePayload
} from "src/app/@core/models/student/student-residence";
import { StudentsService } from "src/app/@core/services/student/students.service";
import Swal from "sweetalert2";
import { Router } from "@angular/router";
import { finalize, takeUntil } from "rxjs/operators";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

export class Residence {
	id = "";
	name = "";
	edit = false;
	name_temp = "";
	residenceid?: number;
	residenceTeacherId?: number;
	residenceTeacherName?: string;
	status?: string;
}

@Component({
	selector: "app-student-residences",
	templateUrl: "./student-residences.component.html",
	styleUrls: ["./student-residences.component.scss"]
})
export class StudentResidencesComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject();
	residences: Residence[] = [];
	residenceTeachers: ResidenceTeacher[] = [];

	pendingValue: string;
	selectedResidence: Residence | null;

	isRetrievingStudentResidences = false;

	isAddingStudentResidence = false;

	isUpdatingStudentResidence = false;

	isDeletingStudentResidence = false;

	constructor(
		private studentsService: StudentsService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private router: Router,
		private responseHandler: ResponseHandlerService
	) {
		this.pendingValue = "";
		this.selectedResidence = null;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.getStudentResidences();
	}

	getStudentResidences() {
		this.isRetrievingStudentResidences = true;

		this.studentsService
			.getStudentResidences()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isRetrievingStudentResidences = false))
			)
			.subscribe((resp: any) => {
				this.residences = resp.residences;
				this.residenceTeachers = resp.teachers;
			});
	}

	resetEditValue() {
		this.residences.forEach((sg) => {
			sg.edit = false;
		});
	}

	showAddNewResidenceInput() {
		this.residences.push(new Residence());

		this.pendingValue = this.residences[this.residences.length - 1].name;
		this.selectedResidence = this.residences[this.residences.length - 1];
	}

	public cancel(): void {
		this.selectedResidence = null;
	}

	// I enable editing of the given residence.
	public edit(residence: Residence): void {
		residence.edit = true;
		this.pendingValue = residence.name;
		this.selectedResidence = residence;
	}

	// I process changes to the selected project's name.
	public processChanges(): void {
		if (this.pendingValue !== this.selectedResidence!.name) {
			// CAUTION: Normally, I would emit some sort of "rename" event to the calling
			// context. But, for the sake of simplicity, I'm just mutating the project
			// directly since having several sibling _components that both edit project
			// names is incidental and not the focus of this exploration.

			// console.log(this.selectedResidence);

			this.selectedResidence!.name = this.pendingValue;

			if (this.selectedResidence?.id) {
				this.updateResidence(
					+this.selectedResidence.id,
					this.selectedResidence.name,
					this.selectedResidence.residenceTeacherId!
				);
			} else {
				this.addStudentResidences({
					name: this.selectedResidence!.name,
					residenceTeacherId: this.selectedResidence!.residenceTeacherId!
				});
			}
		}

		this.selectedResidence = null;
	}

	private addStudentResidences(payload: AddStudentResidencePayload) {
		this.isAddingStudentResidence = true;

		this.studentsService
			.addStudentResidences([payload])
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isAddingStudentResidence = false))
			)
			.subscribe({
				next: (res: any) => {
					this.residences = res.residences;
					this.residenceTeachers = res.teachers;

					const message = this.translate.instant(
						"students.residences.toastMessages.residenceAddSuccess"
					);
					this.toastService.success(message);
				},
				error: (error: any) => {
					this.responseHandler.error(error, "addStudentResidences()");
				}
			});
	}

	onResidenceTeacherChange(
		residenceTeacher: ResidenceTeacher,
		residence: Residence
	) {
		if (residence.name) {
			// the user is on updating residence teacher
			this.updateResidence(+residence.id, residence.name, residenceTeacher.id);
		} else {
			// the user is adding residence + the residence teacher
			this.addStudentResidences({
				name: this.pendingValue,
				residenceTeacherId: residenceTeacher.id
			});
		}
	}

	private updateResidence(
		residenceID: number,
		residenceName: string,
		residenceTeacherID?: number
	) {
		const payload: UpdateStudentResidencePayload = {
			id: residenceID,
			name: residenceName,
			residenceTeacherId: residenceTeacherID || null
		};

		this.isUpdatingStudentResidence = true;

		this.studentsService
			.updateStudentResidences(payload)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isUpdatingStudentResidence = false))
			)
			.subscribe({
				next: (res: any) => {
					this.residences = res.residences;
					this.residenceTeachers = res.teachers;

					const message = this.translate.instant(
						"students.residences.toastMessages.residenceUpdateSuccess"
					);
					this.toastService.success(message);
				},
				error: (error: any) => {
					this.responseHandler.error(error, "updateResidence()");
				}
			});
	}

	removeResidence(residence: Residence, index: number) {
		if (residence?.edit === false) {
			this.residences.splice(index, 1);
		} else {
			this.deleteResidenceConfirmation(residence);
		}
	}

	async deleteResidenceConfirmation(residence: Residence) {
		const swalResult = await Swal.fire({
			title: this.translate.instant("students.residences.swal.deleteTitle"),
			text: this.translate.instant("students.residences.swal.deleteText", {
				name: residence.name
			}),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant(
				"common.swal.cancelButtonTextCancel"
			),
			confirmButtonText: this.translate.instant(
				"common.swal.confirmButtonTextYes"
			),
			focusCancel: true
		});

		if (swalResult.isConfirmed) this.deleteResidence(+residence.id);
	}

	private deleteResidence(residenceID: number) {
		this.isDeletingStudentResidence = true;

		this.studentsService
			.deleteStudentResidence(residenceID)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isDeletingStudentResidence = false))
			)
			.subscribe({
				next: (res: any) => {
					this.residences = res.residences;
					this.residenceTeachers = res.teachers;

					const message = this.translate.instant(
						"students.residences.toastMessages.residenceUpdateSuccess"
					);
					this.toastService.success(message);
				},
				error: (error: any) => {
					this.responseHandler.error(error, "deleteResidence()");
				}
			});
	}

	removeResidenceTeacher(residence: Residence) {
		this.updateResidence(+residence.id, residence.name);
	}

	getResidentList(residence: Residence) {
		// console.table(residence);
		this.router.navigate(["/main/students/stRes", residence.id]);
	}
}
