import {Component, Input, OnDestroy, OnInit} from "@angular/core";
import {AbstractControl, FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {TranslateService} from "@ngx-translate/core";
import {StaffGroup} from "src/app/@core/enums/staff/staff-group";
import {emptyStringValidator} from "../../../directives/empty-string-validator.directive";
import {StaffType} from "src/app/@core/enums/staff/staff-type";
import Swal from "sweetalert2";
import {StaffService} from "src/app/@core/services/staff/staff.service";
import {ResponseHandlerService} from "../../../services/response-handler/response-handler.service";
import {Subject} from "rxjs";
import {takeUntil} from "rxjs/operators";
import {DataService} from "../../../services/data/data.service";
import {SchoolTypeData} from "../../../../models/school-type-data";

@Component({
	selector: "app-staff-groups-ui",
	templateUrl: "./staff-groups.component.html",
	styleUrls: ["./staff-groups.component.scss"]
})
export class StaffGroupsComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	@Input() staff!: StaffType;
	@Input() staffGroup!: StaffGroup;

	staffGroups: any[] = [];
	isLoadingStaffGroups = false;
	addStaffGroupSubmit = false;

	staffGroupTitle = "";
	staffGroupTitlePlural = "";
	staffGroupAddBtnName = "";
	staffGroupAdditionFormName = "";
	staffGroupAdditionFormNameError = "";

	staffGroupAdditionForm: FormGroup = new FormGroup({
		groupName: new FormControl(null, [Validators.required, emptyStringValidator])
	});
	staffGroupUpdateForm: FormGroup = new FormGroup({
		groupNames: new FormArray([])
	});

	displayAddNewStaffGroup = false;
	isAddingStaffGroup = false;
	schoolData!: SchoolTypeData;

	constructor(
		private staffService: StaffService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService,
		private dataService: DataService
	) {
	}

	ngOnInit(): void {
		this.loadSchoolTypeData();
	}

	loadSchoolTypeData() {
		this.dataService.schoolData.subscribe((schoolData) => {
			this.schoolData = schoolData;
			if(schoolData) {
				this.loadStaffGroups();
				this.setStaffGroupNames();
				console.log(schoolData);
			}

		});
	}

	get isOlevelSchool(): boolean {
		return this.schoolData?.isOLevelSchool;
	}

	get isIvorianSchool(): boolean {
		return this.schoolData?.isIvorianSchool;
	}

	loadStaffGroups() {
		this.staffGroups = [];
		this.isLoadingStaffGroups = true;
		this.staffService.getStaffGroups(this.staffGroup).pipe(takeUntil(this.destroy$)).subscribe(
			(res) => {
				this.isLoadingStaffGroups = false;
				this.staffGroups = res;
				this.initializeFormArray();
			},
			(err) => {
				this.isLoadingStaffGroups = false;
				this.responseHandler.error(err, "loadStaffGroups()");
			}
		);
	}

	initializeFormArray() {
		for (const group of this.staffGroups) {
			this.groupNames.push(new FormControl(group.name, [Validators.required, emptyStringValidator]));
		}
	}

	get groupNames() {
		return this.staffGroupUpdateForm.get("groupNames") as FormArray;
	}

	removeGroupName(index: number) {
		this.groupNames.removeAt(index);
	}

	clearGroupNames() {
		this.groupNames.clear();
	}

	setStaffGroupNames() {
		switch (this.staff) {
		case StaffType.OFFICIALS:
			this.staffGroupTitle = this.translate.instant("bom.groups." + (this.isOlevelSchool ? "titleBog" : this.isIvorianSchool ? "titleIvory" : "title"));
			this.staffGroupTitlePlural = this.translate.instant("bom.groups." + (this.isOlevelSchool ? "titleBogPlural" : this.isIvorianSchool ? "titleIvoryPlural" : "titlePlural"));
			this.staffGroupAddBtnName = this.translate.instant("bom.groups." + (this.isOlevelSchool ? "addBogBtn" : this.isIvorianSchool ? "addIvoryBtn" : "addBtn"));
			this.staffGroupAdditionFormName = this.translate.instant("bom.groups.addForm." + (this.isOlevelSchool ? "nameBog" : this.isIvorianSchool ? "nameIvory" : "name"));
			this.staffGroupAdditionFormNameError = this.translate.instant("bom.groups.addFormErrors.name");
			break;
		case StaffType.TEACHERS:
			this.staffGroupTitle = this.translate.instant("teachers.groups.title");
			this.staffGroupTitlePlural = this.translate.instant("teachers.groups.titlePlural");
			this.staffGroupAddBtnName = this.translate.instant("teachers.groups.addBtn");
			this.staffGroupAdditionFormName = this.translate.instant("teachers.groups.addForm.name");
			this.staffGroupAdditionFormNameError = this.translate.instant("teachers.groups.addFormErrors.name");
			break;
		case StaffType.WORKERS:
			this.staffGroupTitle = this.translate.instant("staff.groups.title");
			this.staffGroupTitlePlural = this.translate.instant("staff.groups.titlePlural");
			this.staffGroupAddBtnName = this.translate.instant("staff.groups.addBtn");
			this.staffGroupAdditionFormName = this.translate.instant("staff.groups.addForm.name");
			this.staffGroupAdditionFormNameError = this.translate.instant("staff.groups.addFormErrors.name");
			break;
		}
	}

	get staffGroupControls(): { [key: string]: AbstractControl } {
		return this.staffGroupAdditionForm.controls;
	}

	toggleAddStaffGroupDisplay(): void {
		this.displayAddNewStaffGroup = !this.displayAddNewStaffGroup;
		this.staffGroupAdditionForm.reset();
		this.addStaffGroupSubmit = false;
	}

	addStaffGroup(staffGroups: any): void {
		this.addStaffGroupSubmit = true;
		if (!this.staffGroupAdditionForm.valid) {
			return;
		}

		this.isAddingStaffGroup = true;

		this.staffService.addStaffGroup([staffGroups.groupName], this.staffGroup).pipe(takeUntil(this.destroy$)).subscribe(
			(res) => {
				this.staffGroupAdditionForm.reset();
				this.addStaffGroupSubmit = false;
				this.isAddingStaffGroup = false;
				this.responseHandler.success(res, "addStaffGroup()");

				this.clearGroupNames();
				this.loadStaffGroups();
			},
			(err) => {
				this.isAddingStaffGroup = false;
				this.responseHandler.error(err, "addStaffGroup()");
			}
		);
	}

	get staffGroupUpdateControls(): { [key: string]: AbstractControl } {
		return this.staffGroupUpdateForm.controls;
	}

	editClicked(group: any): void {
		group.edit = true;
	}

	cancelEditClicked(group: any): void {
		group.edit = false;
	}

	updateStaffGroup(group: any, groupIndex): void {
		if (this.groupNames.controls[groupIndex].invalid) return;

		const staffGroupName = (this.groupNames.controls[groupIndex].value as string).toUpperCase();

		this.staffService.updateStaffGroup(group.staffgroupid, staffGroupName).pipe(takeUntil(this.destroy$)).subscribe(
			(resp) => {
				group.edit = false;
				group.name = staffGroupName;
				this.responseHandler.success(resp, "updateStaffGroup()");
			},
			(err) => {
				this.responseHandler.error(err, "updateStaffGroup()");
			}
		);
	}

	isDeletingGroup = false;

	async deleteStaffGroupAlert(group: any, index: number) {
		const swalResult = await Swal.fire({
			title: this.translate.instant("common.swal.groups.listItem.deleteConfirmationModal.title", {name: group.name}),
			text: this.translate.instant("common.swal.groups.listItem.deleteConfirmationModal.text", {groupName: group.name}),
			icon: "question",
			showCancelButton: true,
			cancelButtonText: this.translate.instant("common.cancel"),
			confirmButtonText: this.translate.instant("common.okay"),
			focusCancel: true
		});

		if (swalResult.isConfirmed) this.deleteStaffGroup(group, index);
	}

	deleteStaffGroup(group: any, index: number): void {
		this.isDeletingGroup = true;

		this.staffService.deleteStaffGroup(group.staffgroupid).pipe(takeUntil(this.destroy$)).subscribe(
			(resp) => {
				this.staffGroups.splice(index, 1);
				this.removeGroupName(index);
				this.isDeletingGroup = false;
				this.responseHandler.success(resp, "deleteStaffGroup()");
			}, (err) => {
				this.isDeletingGroup = false;
				this.responseHandler.error(err, "deleteStaffGroup()");
			}
		);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
