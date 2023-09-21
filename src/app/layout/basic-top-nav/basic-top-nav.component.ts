import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { TopNavComponent } from "../top-nav/top-nav.component";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";

@Component({
	selector: "app-basic-top-nav",
	templateUrl: "./basic-top-nav.component.html",
	styleUrls: ["./basic-top-nav.component.scss"]
})
export class BasicTopNavComponent extends TopNavComponent {
	@Input() hasNotifications = true;
	@Input() hasSettings = true;

	constructor(
		siteLanguageService: SiteLanguageService,
		dataService: DataService,
		authService: AuthService,
		userService: UserService,
		summaryService: SummaryService,
		toastService: HotToastService,
		messagingService: MessagingService,
		financeService: FinanceService,
		router: Router,
		rolesService: RolesService,
		translate: TranslateService,
		reponseHandler: ResponseHandlerService,) {
		super(
			siteLanguageService,
			dataService,
			authService,
			userService,
			summaryService,
			toastService,
			messagingService,
			financeService,
			router,
			rolesService,
			translate,
			reponseHandler
		);
	}

}
