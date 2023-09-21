import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { map } from "rxjs/operators";
import { DataService } from "src/app/@core/shared/services/data/data.service";

@Component({
	selector: "app-account-invalid",
	templateUrl: "./account-invalid.component.html",
	styleUrls: ["./account-invalid.component.scss"]
})
export class AccountInvalidComponent implements OnInit, OnDestroy {

	// online and offline status check
	networkStatus = false;
	userInit: any;
	userSub?: Subscription;
	isLoading = true;

	constructor(private dataService: DataService) { }

	ngOnDestroy(): void {
		this.userSub?.unsubscribe();
	}

	ngOnInit(): void {
		this.checkNetworkStatus();
		this.getUserInit();
	}

	getUserInit() {
		this.userSub = this.dataService.userInitSubject.subscribe(resp => {
			this.userInit = resp;
			// console.warn(this.userInit);
			if (this.userInit) {
				this.isLoading = false;
			}
		});
	}

	checkNetworkStatus() {
		this.networkStatus = navigator.onLine;
		this.dataService.checkNetworkStatus().pipe(map(() => navigator.onLine))
			.subscribe((status) => {
				this.networkStatus = status;
			});
	}

}
