import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { SchoolService } from "../@core/shared/services/school/school.service";
import { DataService } from "../@core/shared/services/data/data.service";
import { NetworkService } from "../@core/shared/services/network/network.service";
import { RolesService } from "../@core/shared/services/role/roles.service";
import { UserService } from "../@core/shared/services/user/user.service";

@Component({
	selector: "app-awaiting-approval",
	templateUrl: "./awaiting-approval.component.html",
	styleUrls: ["./awaiting-approval.component.scss"]
})
export class AwaitingApprovalComponent implements OnInit {
	isChecked?: boolean;
	// online and offline status check
	networkSub$: Subscription = Subscription.EMPTY;
	networkStatus$ = this.networkService.checkNetworkStatus();

	constructor(
    private dataService: DataService,
    private schoolService: SchoolService,
    public rolesService: RolesService,
	private userService: UserService,
    public networkService: NetworkService
	) {
		const zerakiTheme = JSON.parse(localStorage.getItem("zeraki_theme") || "{}");
		// console.log("theme: ", JSON.parse(localStorage.getItem("theme") || "{}"));
		if (zerakiTheme === "dark") {
			this.isChecked = true;
		} else {
			this.isChecked = false;
		}
	}

	ngOnInit(): void {
		this.checkInits();
		this.dataService.setSchoolTypeData();
		this.rolesService.setUserRoles();
		this.schoolService.setSchoolInfo();
		this.checkNetworkStatus();
	}

	checkInits() {
		this.dataService.setUserInit();
		if (!this.userService.userInfoSubject.value) {
			this.userService.setUserInfo();
		}
	}


	private checkNetworkStatus() {
		// console.warn(navigator.onLine);
		this.networkSub$ = this.networkStatus$.subscribe((status) => {
			// console.warn("Status >> ", status);
			if (status) {
				console.warn("Status >> ", status);
				this.dataService.schoolData.subscribe(resp => {
					if (!resp) {
						this.dataService.setSchoolTypeData();
					}
				});

				this.rolesService.roleSubject.subscribe(resp => {
					if (!resp) {
						this.rolesService.setUserRoles();
					}
				});
			}
		});

	}

}
