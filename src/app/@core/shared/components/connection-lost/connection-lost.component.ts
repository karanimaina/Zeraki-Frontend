import { Component, OnDestroy, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { DeviceDetectorService } from "ngx-device-detector";
import { Subscription } from "rxjs";
import { NetworkService } from "../../services/network/network.service";
// import Swal from "sweetalert2";

@Component({
	selector: "app-connection-lost",
	templateUrl: "./connection-lost.component.html",
	styleUrls: ["./connection-lost.component.scss"]
})
export class ConnectionLostComponent implements OnInit, OnDestroy {
	networkSub: Subscription = Subscription.EMPTY;
	networkStatus$ = this.networkService.checkNetworkStatus();
	navSub?: Subscription;
	isDesktopDevice?: boolean;

	constructor(
		private networkService: NetworkService,
		private router: Router,
		private toastService: HotToastService,
		private translate: TranslateService,
		private deviceService: DeviceDetectorService
	){ 
		this.router.routeReuseStrategy.shouldReuseRoute = () => false;

		this.navSub = this.router.events.subscribe((event) => {
			if (event instanceof NavigationEnd) {
			// Tell the router that, you didn't visit or load the page previously, so mark the navigated flag to false as below.
				this.router.navigated = false;
			}
		});
	}

	ngOnDestroy(): void {
		this.networkSub.unsubscribe();
		this.navSub?.unsubscribe();
	}

	ngOnInit(): void {
		this.isDesktopDevice = this.deviceService.isDesktop();
		//console.warn('this.isDesktopDevice >> ', this.isDesktopDevice);

		// Reload automatically on reconnection
		this.networkSub = this.networkStatus$.subscribe(isOnline => {
			if (isOnline) {
				/**Auto reload on connection restored */
				this.networkService.isNetworkStopped = false;
				this.router.navigated = false;
				console.warn("this.router >> ", this.router.url);
				this.router.navigateByUrl(this.router.url);
			}
		});
		// Swal.fire({
		// 	title: "No internet connection",
		// 	icon: "error",
		// 	confirmButtonText: "Reload",
		// }).then((result) => {
		// 	/* Read more about isConfirmed, isDenied below */
		// 	if (result.isConfirmed) {
		// 		window.location.reload();
		// 	}
		// });
	}

	reload(){
		if (!this.networkService.online) {
			this.networkService.isNetworkStopped = true;
			this.toastService.info(this.translate.instant("common.noInternet"));
		} else {
			this.networkService.isNetworkStopped = false;
			this.router.navigated = false;
			console.warn("this.router >> ", this.router.url);
			this.router.navigateByUrl(this.router.url);
		}
	}



}
