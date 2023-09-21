import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { FormBuilder, FormGroup } from "@angular/forms";
import { StudentsService } from "../../../@core/services/student/students.service";
import { StudentsHouseListComponent } from "../../../@core/shared";
import { Subject } from "rxjs";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { takeUntil } from "rxjs/operators";

@Component({
	selector: "app-house-lists",
	templateUrl: "./house-lists.component.html",
	styleUrls: ["./house-lists.component.scss"]
})
export class HouseListsComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject();
	@ViewChild(StudentsHouseListComponent)
	private studentsHouseListComponent!: StudentsHouseListComponent;

	intakes: Array<any>;
	houseListForm!: FormGroup;
	streamList: Array<any>;
	residenceList: Array<any>;
	selectedIntakeId?: number;
	selectedStreamId?: number;
	selectedResidenceId!: number;
	showList = false;
	schoolTypeData?: SchoolTypeData;

	constructor(
		private dataService: DataService,
		private studentService: StudentsService,
		private formBuilder: FormBuilder
	) {
		this.intakes = [];
		this.streamList = [];
		this.residenceList = [];
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.initForm();
		this.getSchoolTypeData();
		this.loadResidences();
	}

	initForm() {
		this.houseListForm = this.formBuilder.group({
			intake: [null],
			stream: [null],
			residence: [null]
		});
	}

	getSchoolTypeData() {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
			this.intakes = schoolTypeData?.current_forms_list;
		});
	}

	loadResidences() {
		this.studentService
			.getStudentResidences()
			.pipe(takeUntil(this.destroy$))
			.subscribe((residences: any) => {
				this.residenceList = residences?.residences;
			});
	}

	get residence() {
		return this.houseListForm.get("residence");
	}

	get stream() {
		return this.houseListForm.get("stream");
	}

	onFormListSubmit() {
		const { intake, stream, residence } = this.houseListForm.value;

		this.selectedResidenceId = residence ?? null;
		this.selectedIntakeId = intake?.intakeid ?? null;
		this.selectedStreamId = stream ?? null;

		this.showList = true;
		this.studentsHouseListComponent?.getResidentStudents(
			this.selectedResidenceId,
			this.selectedIntakeId,
			this.selectedStreamId
		);
	}

	onIntakeChange() {
		this.streamList = this.houseListForm.value.intake
			? this.houseListForm?.value?.intake?.streams
			: [];
		this.stream?.patchValue(null);
	}
}
