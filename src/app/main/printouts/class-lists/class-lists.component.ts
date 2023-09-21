import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable, of, Subject } from "rxjs";
import { finalize, takeUntil } from "rxjs/operators";
import { Subjects } from "src/app/@core/models/classes/subject";
import { Role } from "src/app/@core/models/Role";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";

@Component({
	selector: "app-class-lists",
	templateUrl: "./class-lists.component.html",
	styleUrls: ["./class-lists.component.scss"]
})
export class ClassListsComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();

	schoolTypeData?: SchoolTypeData;
	allFormsList: any[] = [];
	exams: any;

	selected: any = {
		stream: null,
		intake: null,
		subject: null,
		exam: {},
	};

	intakeId = 0;
	streamId = 0;
	subjectId = 0;
	seriesId = 0;
	egroupId = 0;
	classId = 0;

	isRetrievingClassList = false;

	isLoadingSubjects = false;
	subjects: Subjects[] = [];

	has_params = false;

	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	constructor(
		private dataService: DataService,
		private rolesService: RolesService,
		private classesService: ClassesService,
		private responseHandler: ResponseHandlerService,
	) { }

	ngOnInit(): void {
		this.getSchoolTypeData();
	}

	private getSchoolTypeData() {
		this.dataService.schoolData.pipe(takeUntil(this.destroy$)).subscribe({
			next: (schoolTypeData) => {
				this.schoolTypeData = schoolTypeData;
				this.setIntakeList();
			},
			error: (err) => this.responseHandler.error(err, "getSchoolTypeData()"),
		});
	}

	private setIntakeList() {
		this.allFormsList = [];

		this.schoolTypeData?.current_forms_list.forEach((form: any) => {
			form.label = form.classlevel;
			this.allFormsList.push(form);
		});

		this.schoolTypeData?.graduated_forms_list.forEach((graduatedForm: any) => {
			graduatedForm.label = graduatedForm.graduationYear;
			this.allFormsList.push(graduatedForm);
		});
	}

	onIntakeChanged(intakeID: number) {
		this.invalidateStreams();
		this.invalidateSubjects();

		this.retrieveIntakeSubjects(intakeID);
	}

	invalidateStreams() {
		this.selected.stream = null;
		if (this.selected.intake === null) this.exams = [];
	}

	invalidateSubjects() {
		this.selected.subject = null;
		this.subjects = [];
	}

	private retrieveIntakeSubjects(intakeID: number) {
		const uniqueIntakeSubjects = new Array<Subjects>();

		const foundIntake = this.schoolTypeData?.current_forms_list.find(intake => intake.intakeid === intakeID);
		if (foundIntake) {
			for (const stream of foundIntake.streams) {
				for (const streamSubject of stream.subjects) {
					const foundStreamSubject = uniqueIntakeSubjects.find(subj => subj.subjectId === streamSubject.subjectId);
					if (!foundStreamSubject) {
						uniqueIntakeSubjects.push(streamSubject);
					}
				}
			}
		}
		this.subjects = uniqueIntakeSubjects;
	}

	onStreamChange(streamID: number) {
		this.invalidateSubjects();

		if (!streamID) {
			this.retrieveIntakeSubjects(this.selected.intake.intakeid);
		} else {
			this.retrieveStreamSubjects(streamID);
		}
	}

	private retrieveStreamSubjects(streamID: number) {
		this.isLoadingSubjects = true;

		this.classesService.getStreamSubjects(streamID).pipe(finalize(() => this.isLoadingSubjects = false), takeUntil(this.destroy$)).subscribe({
			next: (resp) => this.subjects = resp,
			error: (err) => this.responseHandler.error(err, "retrieveStreamSubjects()"),
		});
	}

	updateParams() {
		let intakeId = 0;
		let streamId = 0;
		const classId = 0;
		let subjectId = 0;

		if (this.selected?.subject?.subjectId > 0)	subjectId = this.selected.subject.subjectId;

		if (this.selected?.stream?.streamid > 0) {
			streamId = this.selected.stream.streamid;
		} else if (this.selected?.intake?.intakeid > 0) {
			intakeId = this.selected.intake.intakeid;
		}

		this.intakeId = intakeId;
		this.streamId = streamId;
		this.classId = classId;
		this.subjectId = subjectId;
	}

	isFetchingClassList(value: boolean) {
		this.isRetrievingClassList = value;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
