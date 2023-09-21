import { Component, OnInit } from "@angular/core";
import { DeviceDetectorService } from "ngx-device-detector";

@Component({
	selector: "app-track",
	templateUrl: "./track.component.html",
	styleUrls: ["./track.component.scss"]
})
export class TrackComponent implements OnInit {
	selectedFilter!: string;
	oldSms = false;
	credits = 0;
	isDesktopDevice?: boolean;
	isLoadingTrackUsages = true;

	constructor(private deviceService: DeviceDetectorService,
	) {
		this.isDesktopDevice = this.deviceService.isDesktop();
	}

	ngOnInit(): void {
		this.changeFilter("new");
	}

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

	setBalance(balance: number) {
		this.credits = balance;
	}

	updateLoadingTrackUsage(event:boolean) {
		this.isLoadingTrackUsages = event;
	}

}
