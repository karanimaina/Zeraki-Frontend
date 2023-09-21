import { Component, OnDestroy, OnInit } from "@angular/core";
import { SchoolService } from "../@core/shared/services/school/school.service";
import { DataService } from "../@core/shared/services/data/data.service";
import { RolesService } from "../@core/shared/services/role/roles.service";
import { Observable, Subject } from "rxjs";
import { NetworkService } from "../@core/shared/services/network/network.service";
import { Role } from "../@core/models/Role";
import { takeUntil } from "rxjs/operators";
import { SummaryService } from "../@core/shared/services/school/summary/summary.service";
import { UserService } from "../@core/shared/services/user/user.service";
import { Router } from "@angular/router";

@Component({
	selector: "app-main",
	templateUrl: "./main.component.html",
	styleUrls: ["./main.component.scss"]
})
export class MainComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	// online and offline status check
	networkStatus$ = this.networkService.checkNetworkStatus();

	schoolTypeData: any;
	isChecked?: boolean;
	userInit: any;
	showSplash = false;
	isJointAccount = false;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	date = new Date();

	constructor(
    private summaryService: SummaryService,
    private dataService: DataService,
    private schoolService: SchoolService,
    private rolesService: RolesService,
	private userService: UserService,
    public networkService: NetworkService,
	private router?: Router
	) {
		const zerakiTheme = JSON.parse(localStorage.getItem("zeraki_theme") || "{}");
		// console.log("theme: ", JSON.parse(localStorage.getItem("theme") || "{}"));
		if (zerakiTheme === "dark") {
			this.isChecked = true;
		} else {
			this.isChecked = false;
		}
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.checkInits();
		this.dataService.setUserInit();
		this.dataService.setSchoolTypeData();
		this.rolesService.setUserRoles();
		this.schoolService.setSchoolInfo();
		this.checkNetworkStatus();
	}

	checkInits() {
		this.schoolSummaryCheck();
		if (!this.userService.userInfoSubject.value) {
			this.userService.setUserInfo();
		}
	}

	private schoolSummaryCheck(): void {
		this.summaryService.schoolSummary$.subscribe((summary) => {
			if (!summary) {
				this.summaryService.setSchoolSummary();
				return;
			}

			if (summary.classes < 1) {
				this.router?.navigateByUrl("/setup");
			}
		});
	}

	private checkNetworkStatus() {
		// console.warn(navigator.onLine);
		this.networkStatus$.pipe(takeUntil(this.destroy$)).subscribe((status) => {
			// console.warn("Status >> ", status);
			if (status) {
				// console.warn("Status >> ", status);

				if (!this.dataService.schoolData.value)this.dataService.setSchoolTypeData();
				this.rolesService.setUserRoles();
			}
		});

	}

}
