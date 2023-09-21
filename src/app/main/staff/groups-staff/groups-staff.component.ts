import { Component } from "@angular/core";
import { StaffGroup } from "src/app/@core/enums/staff/staff-group";
import { StaffType } from "src/app/@core/enums/staff/staff-type";

@Component({
	selector: "app-groups-staff",
	templateUrl: "./groups-staff.component.html",
	styleUrls: ["./groups-staff.component.scss"]
})
export class GroupsStaffComponent {
	staff: StaffType = StaffType.WORKERS;
	staffGroup: StaffGroup = StaffGroup.WORKER_GROUP;
}
