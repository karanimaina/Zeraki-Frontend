import { Component, OnInit } from "@angular/core";
import { Subscription, merge, of, fromEvent } from "rxjs";
import { map } from "rxjs/operators";
import { DataService } from "../@core/shared/services/data/data.service";
import { UserService } from "../@core/shared/services/user/user.service";

@Component({
	selector: "app-lock",
	templateUrl: "./lock.component.html",
})
export class LockComponent implements OnInit {
	// online and offline status check
	networkStatus = false;
	newtworkStatus$: Subscription = Subscription.EMPTY;

	constructor(
		private userService: UserService,
		private dataService: DataService
	) { }

	ngOnInit() {
		this.checkNetworkStatus();
		this.dataService.setUserInit();
		this.checkInits();
	}

	checkInits() {
		if (!this.userService.userInfoSubject.value) {
			this.userService.setUserInfo();
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
			.subscribe((status) => {
				this.networkStatus = status;
			});

	}
}