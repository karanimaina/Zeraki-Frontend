import {Component} from "@angular/core";
import {StaffType} from "../../../@core/enums/staff/staff-type";
import {StaffGroup} from "../../../@core/enums/staff/staff-group";

@Component({
	selector: "app-manage-staff",
	templateUrl: "./manage-staff.component.html",
	styleUrls: ["./manage-staff.component.scss"]
})
export class ManageStaffComponent {
	staff: StaffType = StaffType.WORKERS;
	staffGroup: StaffGroup = StaffGroup.WORKER_GROUP;
}
