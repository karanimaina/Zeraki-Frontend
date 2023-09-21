import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { StudentResidence } from "../../../../@core/models/student/residence/student-residence";
import { SchoolInfo } from "../../../../@core/models/school-info";
import { SchoolGenderTypes } from "../../../../@core/enums/gender/school-gender-types";
import { BoardingStatus } from "src/app/@core/enums/boarding-status/boarding-status";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";

@Component({
	selector: "app-all-students-options",
	templateUrl: "./all-students-options.component.html",
	styleUrls: ["./all-students-options.component.scss"]
})
export class AllStudentsOptionsComponent implements OnInit {
	@Output() allStudentsOptionsUpdated: EventEmitter<any> = new EventEmitter<any>();

	schoolInfo!: SchoolInfo;
	allStudentsOptionsFormGroup!: FormGroup;
	readonly schoolGenderTypes = SchoolGenderTypes;
	readonly boardingStatus = BoardingStatus;
	studentResidences: StudentResidence[] = [];
	loadingStudentResidences = true;
	constructor(
		private formBuilder: FormBuilder,
		private studentService: StudentsService,
		private schoolService: SchoolService,
	) {
		this.initializeAllStudentsOptionsFormGroup();
	}

	ngOnInit(): void {
		this.getSchoolInfo();
		this.getStudentResidences();
	}

	initializeAllStudentsOptionsFormGroup(): void {
		this.allStudentsOptionsFormGroup = this.formBuilder.group({
			boardingStatus: [null],
			gender: [null],
			residenceIds: [""],
		});

		this.watchAllStudentsOptionsFormGroupChanges();
	}

	watchAllStudentsOptionsFormGroupChanges(): void {
		this.allStudentsOptionsFormGroup.valueChanges.subscribe((value) => {
			const options = { ...value };

			if (!options.boardingStatus) {
				delete options.boardingStatus;
			}

			if (!options.gender) {
				delete options.gender;
			}

			if (!options.residenceIds) {
				delete options.residenceIds;
			}

			this.allStudentsOptionsUpdated.emit(options);
		});
	}

	getSchoolInfo(): void {
		this.schoolService.schoolInfo.subscribe((schoolInfo: SchoolInfo) => {
			this.schoolInfo = schoolInfo;
		});
	}

	getStudentResidences(): void {
		this.studentService.getStudentResidences().subscribe((res: any) => {
			this.studentResidences = res?.residences || [];
			this.loadingStudentResidences = false;
		}, () => {
			this.loadingStudentResidences = false;
		});
	}

	get showStudentOptions(): boolean {
		return this.schoolInfo?.boardingStatus == this.boardingStatus.Mixed ||
			this.schoolInfo?.genderType == this.schoolGenderTypes.Mixed ||
			this.schoolInfo?.boardingStatus == this.boardingStatus.Boarding;
	}
}
