// import { SelectionModel } from '@angular/cdk/collection';
import { Component, OnDestroy, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Observable, Subject } from "rxjs";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import { takeUntil } from "rxjs/operators";
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Intake } from "../../../@core/models/classes/intake/intake";
import { ClassTeacher } from "../../../@core/models/classes/class-teacher/class-teacher";
import { Student } from "../../../@core/models/student/student";
import { ClassStream } from "../../../@core/models/classes/stream/class-stream";
import { FormOrYearPipe } from "../../../@core/shared/pipes/form-or-year.pipe";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { Major } from "../../../@core/models/major/major";
import { MajorService } from "../../../@core/services/classes/majors/major.service";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-move-student",
	templateUrl: "./move-student.component.html",
	styleUrls: ["./move-student.component.scss"]
})
export class MoveStudentComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();

	DEFAULT_STREAMID = -1;
	schoolTypeData!: SchoolTypeData;
	classTeacher!: ClassTeacher;
	intakes: Intake[] = [];
	selectedIntake!: Intake;
	selectedStream!: ClassStream;
	destinationIntakes: Intake[] = [];
	selectedDestinationIntake!: Intake;
	studentsList: Student[] = [];
	majors: Major[] = [];
	selectedMajor!: Major;
	destinationMajors: Major[] = [];
	majorsMap: { [key: number]: string } = {};

	loadingStudents = false;
	movingStudents = false;

	moveStudentsActive = false;
	moveStudentsForm: FormGroup = this.fb.group({
		sourceIntake: [[]],
		sourceStream: [[]],
		studentsToBeMoved: this.fb.array([]),
		selectAllStudentsToggle: [false],
		destinationIntake: [[], Validators.required],
		destinationStream: [[], Validators.required]
	});
	submitted = false;

	get isNormalTeacher() {
		return this.rolesService.isNormalTeacher;
	}

	constructor(
		private studentsService: StudentsService,
		private dataService: DataService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private fb: FormBuilder,
		private formOrYearPipe: FormOrYearPipe,
		private majorService: MajorService,
		private rolesService: RolesService,
	) { }

	ngOnInit(): void {
		this.getStreamInfo();
		this.getSchoolTypeData();
		this.watchFormChanges();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	private getStreamInfo() {
		forkJoin([this.getStreamInfoForClassTeacher(this.DEFAULT_STREAMID), this.getFormStreams()])
			.subscribe(([{ ct }, { intakes }]) => {
				this.classTeacher = ct;
				this.intakes = intakes;

				this.setDefaultSourceIntakeAndStream();
			});
	}

	private getStreamInfoForClassTeacher(streamId) {
		return this.studentsService.getStreamInfo_ClassTeacher(streamId);
	}

	private getFormStreams() {
		return <Observable<{ intakes: Intake[] }>>this.studentsService.getFormStreams(false, true);
	}

	private setDefaultSourceIntakeAndStream() {
		if (this.defaultIntake) {
			const defaultStream = this.defaultIntake.streams.find(stream => stream.streamid == this.classTeacher.streamid);

			this.moveStudentsForm.patchValue({
				sourceIntake: this.defaultIntake,
				sourceStream: defaultStream
			});
		}
	}

	private get defaultIntake(): Intake {
		return this.classTeacher
			? this.intakes.find(intake => intake.streams.some(stream => stream.streamid == this.classTeacher.streamid))!
			: null!;
	}

	private getSchoolTypeData() {
		this.dataService.schoolData
			.pipe(takeUntil(this.destroy$))
			.subscribe(val => {
				this.schoolTypeData = val;
				if (this.schoolTypeData) {
					this.setGuineaRelatedInputValues();
					this.getMajors();
				}
			});
	}

	private setGuineaRelatedInputValues() {
		if (!this.schoolTypeData?.isGuineaSchool && !this.schoolTypeData?.isIvorianSchool)
			return;

		this.moveStudentsForm.addControl("moveStudentsBy", this.fb.control("stream"));
		this.moveStudentsForm.addControl("sourceMajor", this.fb.control(null));
		this.moveStudentsForm.addControl("destinationMajor", this.fb.control(null));

		this.watchChangesForMoveStudentsBy();
		this.watchChangesForSourceMajor();
	}

	private watchChangesForMoveStudentsBy() {
		this.moveStudentsForm.get("moveStudentsBy")?.valueChanges
			.subscribe((moveStudentsBy) => {
				this.submitted = false;
				this.fetchStudentsList();

				if (moveStudentsBy == "stream") {
					this.addValidatorsToDestinationIntakeAndStream();
					this.clearValidatorsForDestinationMajor();
				} else {
					this.clearValidatorsForDestinationIntakeAndStream();
					this.addValidatorsToDestinationMajor();
				}
			});
	}

	private addValidatorsToDestinationIntakeAndStream() {
		this.moveStudentsForm.get("destinationIntake")?.addValidators(Validators.required);
		this.moveStudentsForm.get("destinationIntake")?.updateValueAndValidity();
		this.moveStudentsForm.get("destinationStream")?.addValidators(Validators.required);
		this.moveStudentsForm.get("destinationStream")?.updateValueAndValidity();
	}

	private addValidatorsToDestinationMajor() {
		this.moveStudentsForm.get("destinationMajor")?.addValidators(Validators.required);
		this.moveStudentsForm.get("destinationMajor")?.updateValueAndValidity();
	}

	private clearValidatorsForDestinationIntakeAndStream() {
		this.moveStudentsForm.get("destinationIntake")?.clearValidators();
		this.moveStudentsForm.get("destinationIntake")?.updateValueAndValidity();
		this.moveStudentsForm.get("destinationStream")?.clearValidators();
		this.moveStudentsForm.get("destinationStream")?.updateValueAndValidity();
	}

	private clearValidatorsForDestinationMajor() {
		this.moveStudentsForm.get("destinationMajor")?.clearValidators();
		this.moveStudentsForm.get("destinationMajor")?.updateValueAndValidity();
	}

	private watchChangesForSourceMajor() {
		this.moveStudentsForm.get("sourceMajor")?.valueChanges
			.subscribe((selectedMajor) => {
				this.selectedMajor = selectedMajor;
				this.fetchStudentsList();
				this.updateDestinationMajors();
			});
	}

	updateDestinationMajors() {
		this.destinationMajors = this.majors.filter(major => major.majorId !== this.selectedMajor.majorId);
	}

	private getMajors() {
		if (!this.schoolTypeData?.isGuineaSchool && !this.schoolTypeData?.isIvorianSchool)
			return;

		this.majorService.getMajors()
			.pipe(takeUntil(this.destroy$))
			.subscribe(({ majors }) => {
				this.majors = majors;
				this.majors.forEach((major) => {
					this.majorsMap[major.majorId] = major.name;
				});
			});
	}

	private watchFormChanges() {
		this.watchChangesForSourceIntake();
		this.watchChangesForSourceStream();
		this.watchChangesForDestinationIntake();
		this.watchChangesForSelectAllToggle();
	}

	private watchChangesForSourceIntake() {
		this.moveStudentsForm.get("sourceIntake")?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe((selectedIntake) => {
				this.selectedIntake = selectedIntake;
				this.onSelectedFormChange();
			});
	}

	private onSelectedFormChange() {
		const defaultStream = this.selectedIntake?.streams.find((stream) => stream.name == this.selectedStream?.name);

		this.moveStudentsForm.patchValue({
			sourceStream: defaultStream
		});
	}

	private watchChangesForSourceStream() {
		this.moveStudentsForm.get("sourceStream")?.valueChanges
			.pipe(takeUntil(this.destroy$))
			.subscribe((selectedStream) => {
				this.selectedStream = selectedStream;
				this.onSelectedStreamChange();
			});
	}

	private onSelectedStreamChange() {
		if (!this.selectedStream)
			return;

		this.resetDestinationIntakeAndStream();
		this.fetchStudentsList();
		this.getDestinations();
	}

	private resetDestinationIntakeAndStream() {
		this.moveStudentsForm.patchValue({
			destinationIntake: null,
			destinationStream: null,
			selectAllStudentsToggle: false
		});
	}

	private fetchStudentsList() {
		if (!this.selectedStream) return;

		this.loadingStudents = true;
		this.getStudentsListByStreamOrMajor()
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (students: any) => {
					this.studentsList = students || [];
					this.loadingStudents = false;

					this.initiateMoveStudents();
				},
				error: () => {
					this.loadingStudents = false;
				}
			});
	}

	private getStudentsListByStreamOrMajor() {
		if (this.moveStudentsByMajor && this.selectedMajor) {
			return this.studentsService.getStudentListByStreamAndMajor(this.selectedStream.streamid, this.selectedMajor.majorId);
		} else {
			return this.studentsService.getStudentsList_Stream(this.selectedStream.streamid);
		}
	}

	private initiateMoveStudents() {
		this.studentsToBeMovedFormArray.clear();
		this.studentsList.forEach(() => this.studentsToBeMovedFormArray.push(this.fb.control(false)));
	}

	private get studentsToBeMovedFormArray(): FormArray {
		return <FormArray> this.moveStudentsForm.get("studentsToBeMoved");
	}

	private getDestinations() {
		this.getStreamInfoForClassTeacher(this.selectedStream.streamid)
			.pipe(takeUntil(this.destroy$))
			.subscribe(({ ct }) => {
				this.destinationIntakes = ct.destinations || [];
			});
	}

	private watchChangesForDestinationIntake() {
		this.moveStudentsForm.get("destinationIntake")?.valueChanges
			.subscribe((selectedDestinationIntake) => {
				this.selectedDestinationIntake = selectedDestinationIntake;
				this.onSelectedDestinationIntakeChange();
			});
	}

	private onSelectedDestinationIntakeChange() {
		this.moveStudentsForm.patchValue({
			destinationStream: null
		});
	}

	private watchChangesForSelectAllToggle() {
		this.moveStudentsForm.get("selectAllStudentsToggle")?.valueChanges
			.subscribe((selectAllStudents) => {
				this.onSelectAllToggle(selectAllStudents);
			});
	}

	private onSelectAllToggle(selectAllStudents) {
		this.studentsToBeMovedFormArray.controls.forEach(control => control.setValue(selectAllStudents));
	}

	get f():{[key: string]: AbstractControl} {
		return this.moveStudentsForm.controls;
	}

	confirmMoveStudents() {
		this.submitted = true;

		if (this.moveStudentsForm.invalid || !this.selectedStudentIndexes.length)
			return;

		Swal.fire({
			title: this.translate.instant("students.move.swal.title"),
			text: this.confirmTextMessage,
			icon: "question",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes")
		}).then((result) => {
			if (result.isConfirmed) {
				this.moveStudents();
			}
		});
	}

	get selectedStudentIndexes(): number[] {
		return this.studentsToBeMovedFormArray.value
			.map((isChecked, index) => ({ isChecked, index }))
			.filter(({ isChecked }) => isChecked == true)
			.map(({ index }) => index);
	}

	get confirmTextMessage() {
		const {destinationStream, destinationMajor} = this.moveStudentsForm.value;
		return this.moveStudentsByMajor
			? this.translate.instant("students.move.swal.text5", {
				sourceMajor: this.selectedMajor.name,
				destinationMajor: destinationMajor.name
			})
			: this.translate.instant("students.move.swal.text4", {
				formOrYear: (this.formOrYearPipe.transform(this.schoolTypeData?.formoryear)),
				form: this.selectedDestinationIntake.form,
				stream: destinationStream.name
			});
	}

	get moveStudentsByMajor() {
		return (this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool) && !this.moveStudentsByStream;
	}

	moveStudents() {
		const selectedStudents = this.studentsList
			.filter((student, index) => this.selectedStudentIndexes.includes(index))
			.map((student) => student.userid);

		this.movingStudents = true;
		this.moveStudentsByMajorOrStream(selectedStudents)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: () => {
					const message = this.translate.instant("students.move.toastMessages.moveSuccess");
					this.toastService.success(message);

					this.filterMovedStudentsFromStudentsList();
					this.filterMovedStudentsFromMoveStudentsForm();
					this.setMoveStudents();
					this.submitted = false;
					this.movingStudents = false;
				},
				error: () => {
					const message = this.translate.instant("students.move.toastMessages.moveError");
					this.toastService.error(message);
					this.movingStudents = false;
				}
			});
	}

	private moveStudentsByMajorOrStream(students) {
		const {sourceStream, destinationStream, destinationMajor} = this.moveStudentsForm.value;

		if (this.moveStudentsByMajor) {
			return this.studentsService.moveStudentsByMajor(this.selectedMajor.majorId, destinationMajor.majorId, students);
		} else {
			return this.studentsService.moveStudents(sourceStream.streamid, destinationStream.streamid, students);
		}
	}

	private filterMovedStudentsFromStudentsList() {
		this.studentsList = this.studentsList.filter((student, index) => !this.selectedStudentIndexes.includes(index));
	}

	private filterMovedStudentsFromMoveStudentsForm() {
		for (const studentIndex of this.selectedStudentIndexes) {
			this.studentsToBeMovedFormArray.removeAt(studentIndex);
		}
	}

	setMoveStudents() {
		this.moveStudentsActive = !this.moveStudentsActive;
	}

	get noStudentSelected() {
		return this.submitted && !this.selectedStudentIndexes.length;
	}

	get classHasStudents() {
		return this.studentsList.length && !this.loadingStudents;
	}

	get showMoveStudentsByRadioBtn() {
		return this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool;
	}

	get showSourceMajorSelectInput() {
		return (this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool) && !this.moveStudentsByStream;
	}

	get showDestinationIntakeAndStream() {
		return ((!this.schoolTypeData?.isGuineaSchool && !this.schoolTypeData?.isIvorianSchool )|| this.moveStudentsByStream);
	}

	get showDestinationMajorSelectInput() {
		return (this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool) && !this.moveStudentsByStream;
	}

	get moveStudentsByStream() {
		return this.moveStudentsForm.get("moveStudentsBy")?.value === "stream";
	}
}
