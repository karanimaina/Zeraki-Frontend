import { Component, OnInit } from "@angular/core";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { DataService } from "../../../@core/shared/services/data/data.service";

@Component({
	selector: "app-dashboard-top-nav",
	templateUrl: "./dashboard-top-nav.component.html",
	styleUrls: ["./dashboard-top-nav.component.scss"]
})
export class DashboardTopNavComponent implements OnInit {
	schoolDataType!: SchoolTypeData;
	loggedInUserRoles!: any;

	constructor(private dataService: DataService, private authService: AuthService) {
		this.dataService.schoolData.subscribe((schoolDataType) => {
			this.schoolDataType = schoolDataType;
		});

		this.loggedInUserRoles = this.authService.loggedInUser.roles;
	}

	ngOnInit(): void {
	}

}
