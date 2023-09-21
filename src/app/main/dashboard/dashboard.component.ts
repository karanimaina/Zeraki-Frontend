import { Component, OnDestroy, OnInit } from "@angular/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { NetworkService } from "src/app/@core/shared/services/network/network.service";
import { RolesService } from "../../@core/shared/services/role/roles.service";
import { SchoolService } from "../../@core/shared/services/school/school.service";
import { SchoolInfo } from "../../@core/models/school-info";
import { Observable, Subject } from "rxjs";
import { Role } from "src/app/@core/models/Role";

@Component({
	selector: "app-dashboard",
	templateUrl: "./dashboard.component.html",
	styleUrls: ["./dashboard.component.scss"]
})
export class DashboardComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	user_init: any;
	userRoles$: Observable<Role> = this.roleService.roleSubject;
	school_profile!: SchoolInfo;

	constructor(
		private dataService: DataService,
		private roleService: RolesService,
		public networkService: NetworkService,
		private schoolService: SchoolService) { }

	ngOnInit(): void {
		this.loadUserInit();
		this.loadSchoolProfile();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	loadUserInit() {
		this.dataService.userInitSubject.subscribe(res => {
			this.user_init = res;
		});
	}

	loadSchoolProfile() {
		this.schoolService.schoolInfo.subscribe((res) => {
			this.school_profile = res;
			// this.school_profile.subscription.alert_type +='-light';

			if (this.school_profile?.subscription?.msg_long) {

				switch (this.school_profile?.subscription.alert_type) {
				case "alert-danger":
					this.school_profile.subscription.alert_class = "bg-danger-light";
					break;
				case "alert-warning":
					this.school_profile.subscription.alert_class = "bg-warning-light";
					break;
				case "alert-info":
					this.school_profile.subscription.alert_class = "bg-info-light";
					break;
				case "alert-success":
					this.school_profile.subscription.alert_class = "bg-success-light";
					break;
				}
			}
		});
	}

}
