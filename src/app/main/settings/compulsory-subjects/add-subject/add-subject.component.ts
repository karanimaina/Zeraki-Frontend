import {Component, OnDestroy, OnInit} from "@angular/core";
import {ClassSubject} from "../../../../@core/models/subject/class-subject";
import {ClassesService} from "../../../../@core/services/classes/classes.service";
import {combineLatest, Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {FormArray, FormBuilder, FormGroup} from "@angular/forms";
import {DataService} from "../../../../@core/shared/services/data/data.service";
import {SchoolTypeData} from "../../../../@core/models/school-type-data";
import {
	CompulsorySubjectsService
} from "../../../../@core/services/settings/compulsory-subjects/compulsory-subjects.service";
import { Router } from "@angular/router";
import {ResponseHandlerService} from "../../../../@core/shared/services/response-handler/response-handler.service";
import {HotToastService} from "@ngneat/hot-toast";

@Component({
	selector: "app-add-subject",
	templateUrl: "./add-subject.component.html",
	styleUrls: ["./add-subject.component.scss"]
})
export class AddSubjectComponent implements OnInit, OnDestroy {
	fetchingSubjects = true;
	subjects: ClassSubject[] = [];
	destroy$: Subject<boolean> = new Subject<boolean>();
	compulsorySubjectsFormGroup!: FormGroup;
	schoolTypeData!: SchoolTypeData;
	addingCompulsorySubjects = false;
	constructor(
		private classesService: ClassesService,
		private compSubjectsService: CompulsorySubjectsService,
		private responseHandler: ResponseHandlerService,
		private toastService: HotToastService,
		private router: Router,
		private fb: FormBuilder,
		private dataService: DataService) { }

	ngOnInit(): void {
		this.initializeCompulsorySubjectsFormGroup();
		this.initializePageData();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	initializeCompulsorySubjectsFormGroup() {
		this.compulsorySubjectsFormGroup = this.fb.group({
			subjects: this.fb.array([])
		});
	}

	private initializePageData() {
		combineLatest([
			this.dataService.getSchoolTypeData(),
			this.classesService.getSubjects()
		]).pipe(takeUntil(this.destroy$))
			.subscribe(([schoolTypeData, subjectsResponse]) => {
				this.schoolTypeData = schoolTypeData;
				this.subjects = subjectsResponse?.subjects || [];
				this.fetchingSubjects = false;
				this.addSubjectsToForm();
			}, () => {
				this.fetchingSubjects = false;
			});
	}

	private addSubjectsToForm() {
		this.subjectsFormArray.clear();
		this.subjects.forEach((subject) => {
			const isCompulsory = this.schoolTypeData?.compulsory_subject_int_codes?.includes(subject.intCode);
			this.subjectsFormArray.push(this.fb.group({
				subjectId: subject.subjectId,
				selected: {value: isCompulsory, disabled: isCompulsory}
			}));
		});
	}

	private get subjectsFormArray() {
		return this.compulsorySubjectsFormGroup.get("subjects") as FormArray;
	}

	addCompulsorySubjects() {
		const selectedSubjectIds = this.subjectsFormArray.value
			.filter((subject: any) => subject.selected)
			.map((subject: any) => ({subjectId: subject.subjectId}));

		if (selectedSubjectIds.length === 0) {
			this.toastService.warning("Please select at least one subject");
			return;
		}

		this.addingCompulsorySubjects = true;
		this.compSubjectsService.addCompulsorySubjects(selectedSubjectIds)
			.subscribe((res) => {
				this.addingCompulsorySubjects = false;
				this.dataService.setSchoolTypeData();
				this.responseHandler.success(res, "addCompulsorySubjects()");
				this.navigateBack();
			}, (error) => {
				this.addingCompulsorySubjects = false;
				this.responseHandler.error(error, "addCompulsorySubjects()");
			});
	}

	navigateBack() {
		this.router.navigate(["/main/settings/compulsory-subjects"]);
	}
}
