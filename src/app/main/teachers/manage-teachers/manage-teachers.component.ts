import {Component, OnDestroy, OnInit} from "@angular/core";
import {StaffType} from "../../../@core/enums/staff/staff-type";
import {StaffGroup} from "../../../@core/enums/staff/staff-group";
import { Subject } from "rxjs";

@Component({
	selector: "app-manage-teachers",
	templateUrl: "./manage-teachers.component.html",
	styleUrls: ["./manage-teachers.component.scss"]
})
export class ManageTeachersComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	staffType: StaffType = StaffType.TEACHERS;
	staffGroup: StaffGroup = StaffGroup.TEACHER_GROUP;
	optionalColumns: string[] = [
		"username",
		"tscNumber",
		"gender"
	];
	constructor(){}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
	
	ngOnInit(): void {}
}
