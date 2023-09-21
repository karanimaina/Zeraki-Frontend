import { Component } from "@angular/core";
import { StaffGroup } from "src/app/@core/enums/staff/staff-group";
import { StaffType } from "src/app/@core/enums/staff/staff-type";

@Component({
	selector: "app-bom-groups",
	templateUrl: "./bom-groups.component.html",
	styleUrls: ["./bom-groups.component.scss"]
})
export class BomGroupsComponent {
	staff: StaffType = StaffType.OFFICIALS;
	staffGroup: StaffGroup = StaffGroup.OFFICIAL_GROUP;
}
