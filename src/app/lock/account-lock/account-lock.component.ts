import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";

@Component({
	selector: "app-account-lock",
	templateUrl: "./account-lock.component.html",
	styleUrls: ["./account-lock.component.scss"]
})
export class AccountLockComponent implements OnInit {

	userInit: any;
	time: any;
	timerObj: any;

	isLoading = false;
	showContact = false;

	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	constructor(
		private dataService: DataService,
		private router: Router,
		private rolesService: RolesService,
		private schoolService: SchoolService,
		private userService: UserService,
		private activatedRoute: ActivatedRoute
	) { }

	ngOnInit(): void {
		this.checkInits();
		this.dataService.setSchoolTypeData();
		this.rolesService.setUserRoles();
		this.schoolService.setSchoolInfo();
		this.loadUserDetails();
	}

	checkInits() {
		if (!this.userService.userInfoSubject.value) {
			this.userService.setUserInfo();
		}
	}

	/**
   * Load Content section
   */
	loadUserDetails() {
		this.isLoading = true;
		this.dataService.getUserInit().subscribe((res) => {
			// const obj: any = {
			// 	"school_invoice_info": {
			// 		"account_suspended": true,
			// 		"dueProformaInvoice": true,
			// 		"invoice_timestamp_seconds": 1652130000,
			// 		"contact_msg": "Contact Zeraki on <a href=\"tel:0707625331\">0707625331</a>",
			// 		"proformaid": 39,
			// 		"show_modal": false,
			// 		"invoice_msg": "Your Zeraki Analytics subscription expired on 10/May/2022",
			// 		"contact_number": "0707625331"
			// 	},
			// 	"school_selected": true,
			// 	"customer_care_number": "0707625331",
			// 	"role": 40,
			// 	"schools": [
			// 		{
			// 			"schoolid": 2,
			// 			"name": "Zeraki Demo School",
			// 			"logo": "97d481116534459cb409cf1782063685_2.png",
			// 			"type": "KCSE"
			// 		}
			// 	],
			// 	"isRelationshipManager": false,
			// 	"auth_msg": "Do you have any enquiries? Contact <b>Zeraki Customer Support</b> on <b><a href=\"tel:0707625331\">0707625331</a></b>, or your account manager (The Account Manager) on 0724136105",
			// 	"isLitemoreEditor": false,
			// 	"isStudent": false,
			// 	"school_validity_info": {
			// 		"is_valid_school": true,
			// 		"validity_type": 1
			// 	}
			// };
			this.userInit = res;
			this.initTimer();

		}, (err) => {
			this.isLoading = false;
		});
	}

	/**
	 * Timer Section
	 */

	initTimer() {
		/** Expiry date converted from seconds to milliseconds */
		const expiryDate = this.userInit?.school_invoice_info?.invoice_timestamp_seconds * 1000;
		const myfunc = setInterval(() => {
			const now = new Date().getTime();
			const countDownDate = new Date(expiryDate).getTime();
			const timeleft = now - countDownDate;
			const days = Math.floor(timeleft / (1000 * 60 * 60 * 24));
			const hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((timeleft % (1000 * 60)) / 1000);
			this.timerObj = {
				days: days,
				hours: hours,
				minutes: minutes,
				seconds: seconds
			};
			this.isLoading = false;
		}, 1000);

	}

	viewInvoice() {
		let url = "../";
		if (this.userInit.school_invoice_info.proformaid) {
			url += "proforma/" + this.userInit.school_invoice_info.proformaid;
		} else {
			url += "invoice/" + this.userInit.school_invoice_info.invoiceid;
		}
		this.router.navigate([url], { relativeTo: this.activatedRoute });
	}

}
