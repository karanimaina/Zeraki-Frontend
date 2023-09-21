import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { Role } from "../../../@core/models/Role";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

@Component({
	selector: "app-manage",
	templateUrl: "./manage.component.html",
	styleUrls: ["./manage.component.scss"]
})
export class ManageComponent implements OnInit, OnDestroy {
	pendingValue: string;
	selectedForm: any | null;
	showClasses = true;
	classesSubscription?: Subscription;
	formsObj: any;
	forms: any;
	teachers: any;
	userRoles!: Role;
	schoolTypeData!: SchoolTypeData;

	constructor(private classesService: ClassesService,
		public route: ActivatedRoute,
		private rolesService: RolesService,
		private dataService: DataService,
		private toastService: HotToastService,
		private translateService:TranslateService
	) {
		this.pendingValue = "";
		this.selectedForm = null;
		this.rolesService.roleSubject.subscribe((role) => {
			this.userRoles = role;
		});

		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnInit(): void {
		this.classesSubscription = this.classesService.getForms().subscribe(val => {
			// console.warn("myClasses >> ", val);
			this.formsObj = val;
			this.forms = this.formsObj.forms;
			this.teachers = this.formsObj.teachers;
		});
	}

	assignSupervisor(intakeId: number, selectedTeacher: any) {
		console.warn(intakeId, selectedTeacher.id);
		// var url = "api/groups/class/classteacher/" + selected_teacher.id + "?streamid=" + streamid;

		this.classesService.assignSupervisor(intakeId, selectedTeacher)
			.subscribe({
				next: data => {
					// let text = "Class Supervisor rights assinged successfully";
					const text = this.translateService.instant("classes.manage.table.rightsAssignedSuccess");
					this.toastService.success(text);
					// console.warn("DATA >> ", data);
					this.formsObj = data;
					this.forms = this.formsObj.forms;
					this.teachers = this.formsObj.teachers;
				},
				error: error => {
					// this.errorMessage = error.message;
					console.error("There was an error!", error);
				}
			});
	}

	removeSupervisor(intakeId: number) {
		console.warn(intakeId);
		// this.toastService.show("Welcome")
		// return;
		// const var url = "api/groups/class/supervisor/" + intakeid;
		this.classesService.removeSupervisor(intakeId)
			.subscribe({
				next: data => {
					// console.warn("DATA >> ", data);
					// let text = "Class Supervisor rights assinged successfully";
					const text = this.translateService.instant("classes.manage.table.rightsRevokedSuccess");
					this.toastService.success(text);
					this.formsObj = data;
					this.forms = this.formsObj.forms;
					this.teachers = this.formsObj.teachers;
				},
				error: error => {
					// this.errorMessage = error.message;
					console.error("There was an error!", error);
				}
			});
	}

	ngOnDestroy(): void {
		this.classesSubscription?.unsubscribe();
	}

	get normalTeacher() {
		return this.rolesService.isNormalTeacher;
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
}
