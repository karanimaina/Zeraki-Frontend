import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import { RolesService } from "../@core/shared/services/role/roles.service";
import { Event, NavigationError, NavigationStart, Router } from "@angular/router";
import { takeUntil } from "rxjs/operators";
import { NetworkService } from "../@core/shared/services/network/network.service";
import { LitemoreUserService } from "../@core/services/litemore/user/litemore-user.service";
import SchoolsTypeState from "../@core/services/litemore/states/schools-type.state";
import { DataService } from "../@core/shared/services/data/data.service";

@Component({
	selector: "app-litemore",
	templateUrl: "./litemore.component.html",
	styleUrls: ["./litemore.component.scss"]
})
export class LitemoreComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	networkStatus$ = this.networkService.checkNetworkStatus();

	isChecked?: boolean;
	date = new Date();

	constructor(
		private schoolsTypeState: SchoolsTypeState,
		private rolesService: RolesService,
		public networkService: NetworkService,
		private dataService: DataService,
		private litemoreUserService: LitemoreUserService,
		private router: Router) {
		const zerakiTheme = JSON.parse(localStorage.getItem("zeraki_theme") || "{}");
		// console.log('theme: ', JSON.parse(localStorage.getItem('theme') || '{}'));
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
		this.litemoreUserService.setLitemoreUser();
		this.schoolsTypeState.retrieveSchoolsTypes();
		this.dataService.setUserInit();
		this.rolesService.setUserRoles();
		this.checkNetworkStatus();
	}

	hideMobileNavOnRouteChange() {
		const bodyElement = document.querySelector("body"); // root 'body' element
		const sidebarMiniElement = document.querySelector("body.sidebar-mini"); // 'body' element with class 'sidebar-mini'

		const sidenav2Elem: HTMLButtonElement | null = document.querySelector("#lit-mobile-sidenav-close-btn");

		this.router.events.subscribe((event: Event) => {
			if (event instanceof NavigationStart) {
				// console.log("Navigation Started - ", event);

				// class 'sidenav-open' is removed from both elements for the sidenav to disappear
				bodyElement?.classList.remove("sidebar-open");
				sidebarMiniElement?.classList.remove("sidebar-open");

				sidenav2Elem?.click();
			}

			if (event instanceof NavigationError) {
				console.error("Navigation Error - ", event.error);
			}
		});
	}

	private checkNetworkStatus() {
		// console.warn(navigator.onLine);
		this.networkStatus$.pipe(takeUntil(this.destroy$)).subscribe((status) => {
			// console.warn("Status >> ", status);
			if (status) {
				// console.warn("Status >> ", status);

				if (!this.rolesService.roleSubject.value) this.rolesService.setUserRoles();
			}
		});

	}

}
