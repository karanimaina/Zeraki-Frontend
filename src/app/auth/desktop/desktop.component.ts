import { Component } from "@angular/core";
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
	selector: "app-new-desktop",
	templateUrl: "./desktop.component.html",
	styleUrls: ["./desktop.component.scss"]
})
export class DesktopComponent extends AuthComponent {

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

}
