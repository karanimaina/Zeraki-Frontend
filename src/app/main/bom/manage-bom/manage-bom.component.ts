import {Component} from "@angular/core";
import {StaffType} from "../../../@core/enums/staff/staff-type";
import {StaffGroup} from "../../../@core/enums/staff/staff-group";

@Component({
	selector: "app-manage-bom",
	templateUrl: "./manage-bom.component.html",
	styleUrls: ["./manage-bom.component.scss"]
})
export class ManageBomComponent {
	staff: StaffType = StaffType.OFFICIALS;
	staffGroup: StaffGroup = StaffGroup.OFFICIAL_GROUP;
}
