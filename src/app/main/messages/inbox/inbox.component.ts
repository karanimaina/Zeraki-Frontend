import { Component, OnInit } from "@angular/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import { DeviceDetectorService } from "ngx-device-detector";

@Component({
	selector: "app-inbox",
	templateUrl: "./inbox.component.html",
	styleUrls: ["./inbox.component.scss"]
})
export class InboxComponent implements OnInit {
	user_roles!: Role;
	isDesktopDevice?: boolean;

	constructor(
		private rolesService: RolesService,
		private deviceService: DeviceDetectorService,
	) {
		this.isDesktopDevice = this.deviceService.isDesktop();

		this.rolesService.roleSubject.subscribe((roles) => {
			this.user_roles = roles;
		});
	}

	ngOnInit(): void {
		this.changeFilter("new");
	}

	selectedFilter!: string;
	oldSms = false;
	changeFilter(type: string) {
		switch (type) {
		case "old":
			this.selectedFilter = "Previous";
			this.oldSms = true;
			break;
		case "new":
			this.selectedFilter = "New";
			this.oldSms = false;
			break;

		default:
			this.selectedFilter = "Previous";
			this.oldSms = true;
			break;
		}
	}

}
