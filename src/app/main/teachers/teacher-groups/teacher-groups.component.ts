import { Component, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { StaffGroup } from "src/app/@core/enums/staff/staff-group";
import { StaffType } from "src/app/@core/enums/staff/staff-type";

@Component({
	selector: "app-teacher-groups",
	templateUrl: "./teacher-groups.component.html",
	styleUrls: ["./teacher-groups.component.scss"]
})

export class TeacherGroupsComponent implements OnInit {
	destroy$: Subject<boolean> = new Subject<boolean>();
	staff: StaffType = StaffType.TEACHERS;
	staffGroup: StaffGroup = StaffGroup.TEACHER_GROUP;
	constructor(){}
	
	ngOnInit(): void {}
}
