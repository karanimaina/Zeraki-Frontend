import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { Role } from "../../../@core/models/Role";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { Subjects } from "src/app/@core/models/classes/subject";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { finalize, takeUntil } from "rxjs/operators";

@Component({
	selector: "app-my-classes",
	templateUrl: "./my-classes.component.html",
	styleUrls: ["./my-classes.component.scss"]
})
export class MyClassesComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	myClassesObj: any;
	userRoles?: Role;
	managedStreams: Array<{ name: string, streamid: number, population: number }> = [];
	managedClasses: Array<{
    name: string;
    population: number;
    streamId: number;
    streamTitle: string;
    classid: number;
    subject: Subjects;
  }> = [];
	schoolTypeData!: SchoolTypeData;
	loading = false;
	myClassesObjHasData = false;

	constructor(
    private classesService: ClassesService,
    private rolesService: RolesService,
    private dataService: DataService,
    private responseHandler: ResponseHandlerService,
	) {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});

		this.rolesService.roleSubject.subscribe((role) => {
			this.userRoles = role;
		});
	}

	ngOnInit(): void {
		this.getMyClasses();
	}

	getMyClasses() {
		this.loading = true;
		this.classesService.getMyClasses()
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => this.loading = false),
			)
			.subscribe({
				next: (resp: any) => {
					const isRespNotEmpty = Object.keys(resp).length > 0;

					const respValues = new Set(Object.values(resp));
					const respAttributesContainAllNulls = (respValues.size === 1 && respValues.has(null));

					this.myClassesObj = resp;
					this.myClassesObjHasData = isRespNotEmpty && !respAttributesContainAllNulls;

					this.managedStreams = resp.streams ?? [];
					this.managedClasses = resp.classes ?? [];
				},
				error: (err) =>this.responseHandler.error(err, "getMyClasses()"),
			});
	}

	get classListsQueryParams() {
		if (this.userRoles?.isSchoolAdmin)	return {};

		return { "hideEvaluationReport": !this.userRoles?.isSchoolAdmin };
	}

	classDetails: any;
	showClassListUI = false;

	showClassListDisplay(classDetails: any) {
		this.classDetails = classDetails;
		this.showClassListUI = true;
	}

	hideClassListDisplay() {
		this.classDetails = null;
		this.showClassListUI = false;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
