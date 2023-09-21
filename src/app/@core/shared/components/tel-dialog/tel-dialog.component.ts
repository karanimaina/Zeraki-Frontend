import { Component, OnInit } from "@angular/core";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { UserInit } from "src/app/@core/models/user_init";
import { DataService } from "../../services/data/data.service";
import {SchoolService} from "../../services/school/school.service";

@Component({
	selector: "app-tel-dialog",
	templateUrl: "./tel-dialog.component.html",
	styleUrls: ["./tel-dialog.component.scss"]
})
export class TelDialogComponent implements OnInit {

	userInit!: UserInit;
	notification_item: any = {};
	school_profile!: SchoolInfo;
	constructor(
		private dataService:DataService,
		private schoolService: SchoolService) { }

	ngOnInit(): void {
		this.dataService.userInitSubject.subscribe(resp => {
			//console.warn('USER INIT >> ', resp.customer_care_number);
			this.userInit = resp;

			if (this.userInit != null && this.userInit.auth_msg != null && (this.userInit.require_auth_reset == null || !this.userInit.require_auth_reset)) {
				this.notification_item = {};
				this.notification_item.msg_short = this.userInit.auth_msg;
				this.notification_item.msg_long = this.userInit.auth_msg;
				this.notification_item.level = 1;
			}
		});

		this.schoolService.schoolInfo.subscribe(resp => {
			this.school_profile = resp;
			if (this.school_profile != null && this.school_profile.subscription != null && this.school_profile.subscription.invoiceid != null) {
				this.notification_item = {};
				this.notification_item.msg_short = this.school_profile.subscription.msg_short;
				this.notification_item.msg_long = this.school_profile.subscription.msg_long;
				this.notification_item.level = 5;
			}
		});

	}

}
