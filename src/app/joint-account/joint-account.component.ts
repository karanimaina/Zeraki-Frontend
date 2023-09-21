import { Component, OnDestroy, OnInit } from "@angular/core";
import { map } from "rxjs/operators";
import { Subscription, merge, of, fromEvent } from "rxjs";
import { SchoolService } from "../@core/shared/services/school/school.service";
import { DataService } from "../@core/shared/services/data/data.service";
import { RolesService } from "../@core/shared/services/role/roles.service";

@Component({
	selector: "app-joint-account",
	templateUrl: "./joint-account.component.html",
	styleUrls: ["./joint-account.component.scss"]
})
export class JointAccountComponent implements OnInit, OnDestroy {

	// online and offline status check
	networkStatus = false;
	newtworkStatus$: Subscription = Subscription.EMPTY;

	schoolTypeData: any;
	isChecked?: boolean;
	userInit: any;
	showSplash = true;
	isJointAccount = true;

	constructor(
    private dataService: DataService,
    private schoolService: SchoolService,
    private rolesService: RolesService) {
		const zerakiTheme = JSON.parse(localStorage.getItem("zeraki_theme") || "{}");
		// console.log("theme: ", JSON.parse(localStorage.getItem("theme") || "{}"));
		if (zerakiTheme === "dark") {
			this.isChecked = true;
		} else {
			this.isChecked = false;
		}
	}

	ngOnDestroy(): void {
		this.newtworkStatus$.unsubscribe();
	}

	ngOnInit(): void {
		setTimeout(() => {
			this.showSplash = !this.showSplash;
			// this.start();
		}, 3000);

		this.checkNetworkStatus();

		this.dataService.setSchoolTypeData();
		this.rolesService.setUserRoles();
		this.schoolService.setSchoolInfo();
	}


	start(): void {
		const loader = document.getElementById("loader")!;
		loadNow(1);

		function loadNow(opacity: any) {
			if (opacity <= 0) {
				displayContent();
			} else {
        loader.style!.opacity = opacity;
        window.setTimeout(function () {
          loadNow(opacity - 0.05);
        }, 50);
			}
		}

		function displayContent() {
			loader.style.display = "none";
		}
	}


	private checkNetworkStatus() {
		this.networkStatus = navigator.onLine;
		this.newtworkStatus$ = merge(
			of(null),
			fromEvent(window, "online"),
			fromEvent(window, "offline")
		)
			.pipe(map(() => navigator.onLine))
			.subscribe((status:any) => {
				console.log("Network Status", status);
				this.networkStatus = status;
				// this.networkStatus = true;
			});

	}



}
