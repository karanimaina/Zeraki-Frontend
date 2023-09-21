import { Component, Output, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { DeviceDetectorService } from "ngx-device-detector";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { AuthComponent } from "../auth.component";

@Component({
	selector: "app-new-mobile",
	templateUrl: "./mobile.component.html",
	styleUrls: ["./mobile.component.scss"]
})
export class MobileComponent extends AuthComponent {
	@Output() aboutPageChild = new EventEmitter<boolean>();

	constructor(
		router: Router,
		authService: AuthService,
		summaryService: SummaryService,
		rolesService: RolesService,
		dataService: DataService,
		userService: UserService,
		toastService: HotToastService,
		deviceService: DeviceDetectorService,
		siteLanguageService: SiteLanguageService,
		translate: TranslateService
	) {
		super(
			router,
			authService,
			summaryService,
			rolesService,
			dataService,
			userService,
			toastService,
			deviceService,
			siteLanguageService,
			translate
		);
	}

	aboutAnalytics() {
		this.aboutPageChild.emit(true);
	}
}
