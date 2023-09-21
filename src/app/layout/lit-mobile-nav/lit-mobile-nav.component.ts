import { Component, OnInit } from "@angular/core";
import { DeviceDetectorService } from "ngx-device-detector";
import { Subject } from "rxjs";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("package.json");

@Component({
	selector: "app-lit-mobile-nav",
	templateUrl: "./hardcoded.html",
	styleUrls: ["./lit-mobile-nav.component.scss"]
})
export class LitMobileNavComponent implements OnInit {

	destroy$: Subject<boolean> = new Subject<boolean>();
	appVersion?: string;
	isDesktopDevice = true;
	navigations: Array<{ name: string, routerLinkURL?: string }> = [];

	readonly LitemoreUserRole = LitemoreUserRole;
	litemoreUser?: LitemoreUser1;

	constructor(
		private deviceService: DeviceDetectorService,
		private _litemoreUserService: LitemoreUserService
	) {
		this.isDesktopDevice = this.deviceService.isDesktop();
	}

	ngOnInit(): void {
		this.getDefaultPath();
		this.appVersion = version;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	private getDefaultPath() {
		this._litemoreUserService.litemoreUser$.subscribe(user => {
			if (user) {
				this.litemoreUser = this._litemoreUserService.initLitemoreUser(user);
				this.getNavigations();
			}
		});
	}

	get litemorePathSuffix(): string {
		return this.litemoreUser?.isAdminOrTechSupport ? "mg" : "am";
	}

	getNavigations() {
		if (this.litemoreUser?.litemoreRoles?.includes(LitemoreUserRole.SUPER_ADMIN)) {
			this.navigations = [
				{
					name: "Anaytics",
					routerLinkURL: `/litemore/${this.litemorePathSuffix}/schools/type/Anaytics`,
				},
				{
					name: "Finance",
					routerLinkURL: `/litemore/${this.litemorePathSuffix}/schools/type/Finance`,
				},
				{
					name: "Timetable",
					routerLinkURL: `/litemore/${this.litemorePathSuffix}/schools/type/Timetable`,
				},
				{
					name: "More",
				},
				{
					name: "ZL Credentials",
					routerLinkURL: "/litemore/mg/zl-credentials",
				},
				{
					name: "Partners",
					routerLinkURL: "/litemore/mg/p/list",
				},
				{
					name: "Feedback",
					routerLinkURL: "/litemore/mg/feedback",
				},
				{
					name: "Products",
					routerLinkURL: "/litemore/mg/zeraki-products",
				},
				{
					name: "SMS",
					routerLinkURL: "/litemore/mg/sms",
				},
				{
					name: "Users",
					routerLinkURL: "/litemore/mg/users",
				},
				{
					name: "Countries",
					routerLinkURL: "/litemore/mg/countries",
				},
				{
					name: "Regions",
					routerLinkURL: "/litemore/mg/regions",
				},
				{
					name: "Counties",
					routerLinkURL: "/litemore/mg/counties",
				}
			];
		} else if (this.litemoreUser?.litemoreRoles?.includes(LitemoreUserRole.LITEMORE_ADMIN)) {
			this.navigations = [
				{
					name: "Anaytics",
					routerLinkURL: `/litemore/${this.litemorePathSuffix}/schools/type/Anaytics`,
				},
				{
					name: "Finance",
					routerLinkURL: `/litemore/${this.litemorePathSuffix}/schools/type/Finance`,
				},
				{
					name: "Timetable",
					routerLinkURL: `/litemore/${this.litemorePathSuffix}/schools/type/Timetable`,
				},
				{
					name: "More",
				},
				{
					name: "ZL Credentials",
					routerLinkURL: "/litemore/mg/zl-credentials",
				},
			];
		}
	}
}
