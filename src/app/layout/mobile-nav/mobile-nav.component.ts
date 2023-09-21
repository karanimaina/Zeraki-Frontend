import { Component, OnDestroy, OnInit } from "@angular/core";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { DataService } from "../../@core/shared/services/data/data.service";
import { SchoolService } from "../../@core/shared/services/school/school.service";
import { DeviceDetectorService } from "ngx-device-detector";
import { combineLatest, Observable, Subject } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { MenuItem } from "src/app/@core/models/menu/menu-item";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { TranslateService } from "@ngx-translate/core";
import { UserInfo } from "src/app/@core/models/user-info";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import { MenuItems } from "../@models/menu-items";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require("package.json");

@Component({
	selector: "app-mobile-nav",
	templateUrl: "./mobile-nav.component.html",
	styleUrls: ["./mobile-nav.component.scss"]
})
export class MobileNavComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	schoolTypeData$: Observable<SchoolTypeData> = this.dataService.schoolData;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	userInfo$: Observable<UserInfo> = this.userService.userInfoSubject;
	schoolInfo$: Observable<SchoolInfo> = this.schoolService.schoolInfo;
	currentLanguage$: Observable<any> = this.siteLanguageService.currentLanguage$;

	appVersion?: string;
	isDesktopDevice = true;

	schoolInfo?: SchoolInfo;
	userRoles?: Role;
	schoolTypeData?: SchoolTypeData;
	userInfo?: UserInfo;

	menuItems: Array<MenuItem> = [];
	mainMenuItems: Array<MenuItem> = [];

	moreMenuItems: Array<MenuItems> = [];

	constructor(
		private rolesService: RolesService,
		private schoolService: SchoolService,
		private dataService: DataService,
		private userService: UserService,
		private deviceService: DeviceDetectorService,
		private siteLanguageService: SiteLanguageService,
		private translateService: TranslateService) {

		this.isDesktopDevice = this.deviceService.isDesktop();
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.appVersion = version;
		this.getUserDetails();
	}

	getUserDetails() {
		combineLatest(
			[
				this.schoolInfo$,
				this.userRoles$,
				this.userInfo$,
				this.schoolTypeData$,
				this.siteLanguageService.currentLanguage$
			]).subscribe(
			([schoolInfo, userRoles, userInfo, schoolTypeData, currentLanguage]) => {
				this.schoolInfo = schoolInfo;
				this.userRoles = userRoles;
				this.userInfo = userInfo;
				this.schoolTypeData = schoolTypeData;

				this.setMainMenuItems();
				!userRoles?.isTeacher? this.moreMenuItems = []: this.setAllMoreMenuItems();
			});
	}

	setMainMenuItems() {
		if (this.userRoles?.isSchoolAdmin || this.userRoles?.isTeacher) {
			this.mainMenuItems = [
				{
					routerLink: ["/main/dashboard"],
					icon: "bi bi-house",
					label: this.translateService.instant("layout.home")
				},
				...this.addExamsMenu,
				...this.checkFinanceIntegration,
				{
					routerLink: ["/main/messages"],
					icon: "bi bi-envelope",
					label: this.translateService.instant("layout.messages"),
				}
			];
		} else if(this.userRoles?.isStudent) {
			this.mainMenuItems = [
				{
					routerLink: ["/main/students/analytics/",`${this.userInfo?.userid}`],
					icon: "bi bi-house",
					label: this.translateService.instant("layout.home")
				},
				...this.checkFinanceIntegration,
				{
					routerLink: ["/main/students/msg",`${this.userInfo?.userid}`],
					icon: "bi bi-envelope",
					label: this.translateService.instant("layout.messages"),
				},
				{
					normalLink: "https://zanalytics.page.link/DtUc",
					icon: "bi bi-book-half",
					label: this.translateService.instant("layout.learning"),
					usesNormalLink: true
				}
			];
		} else {
			this.mainMenuItems = [
				{
					routerLink: ["/main/students/analytics/",`${this.userInfo?.userid}`],
					icon: "bi bi-house",
					label: this.translateService.instant("layout.home")
				},
				this.calendarMenuItem,
				{
					routerLink: ["/main/messages"],
					icon: "bi bi-envelope",
					label: this.translateService.instant("layout.messages"),
				},
				{
					normalLink: "https://zanalytics.page.link/DtUc",
					icon: "bi bi-book-half",
					label: this.translateService.instant("layout.learning"),
					usesNormalLink: true
				}
			];
		}
	}

	get checkFinanceIntegration(): Array<MenuItem> {
		if (this.schoolInfo?.hasfinance) {
			if (this.userRoles?.isPrincipal) {
				return [this.financeMenuItem];
			} else if (this.userRoles?.isStudent) {
				return [this.calendarMenuItem, this.financeMenuItem];
			}
			return [this.calendarMenuItem];
		} else {
			return [this.calendarMenuItem];
		}
	}

	get addExamsMenu(): Array<MenuItem> {
		if (!this.schoolTypeData?.isOLevelSchool) {
			return [this.examMenuItem];
		}
		return [];
	}

	get examMenuItem() {
		return 	{
			routerLink: ["/main/exams"],
			icon: "bi bi-award",
			label: this.translateService.instant("layout.exams")
		};
	}

	get calendarMenuItem() {
		return {
			routerLink: ["/main/events/manage"],
			icon: "bi bi-calendar",
			label: this.translateService.instant("layout.calendar")
		};
	}

	get financeMenuItem() {
		return {
			routerLink: ["/main/finance"],
			icon: "bi bi-cash-coin",
			label: this.translateService.instant("layout.finance")
		};
	}





	setAllMoreMenuItems() {
		this.moreMenuItems = [
			{
				title: this.translateService.instant("layout.menu_items"),
				items: this.moreItems
			},
			...this.productsMenuItems,
			...this.otherMenuItems
		];
	}

	get moreItems() {
		const items: MenuItem[] = [];

		if (this.schoolInfo?.hasfinance && this.userRoles?.isPrincipal) {
			items.push(this.calendarMenuItem);
		}

		if (this.userRoles?.isSchoolAdmin || this.userRoles?.isTeacher) {
			items.push(
				{
					routerLink: ["/main/classes"],
					icon: "bi bi-building",
					label: this.translateService.instant("layout.classes"),
				},
				{
					routerLink: ["/main/students"],
					icon: "bi bi-mortarboard",
					label: this.translateService.instant("layout.students"),
				},
				{
					routerLink: ["/main/teachers"],
					icon: "bi bi-people",
					label: this.translateService.instant("layout.teachers"),
				},
				{
					routerLink: ["/main/staff"],
					icon: "bi bi-person-badge",
					label: this.translateService.instant("layout.staff"),
				},
				{
					routerLink: ["/main/bom"],
					icon: "bi bi-person-video3",
					label: this.schoolTypeData?.isOLevelSchool ? this.translateService.instant("common.bog") : this.translateService.instant("common.bom"),
				}
			);
		}

		if (this.userRoles?.isSchoolAdmin) {
			items.push({
				routerLink: ["/main/printouts"],
				icon: "bi bi-paperclip",
				label: this.translateService.instant("layout.printouts"),
			});
		}
		return items;
	}


	get productsMenuItems() {
		const hasProductMenuItems = this.schoolTypeData?.isKcseSchool || this.schoolTypeData?.isIgcse || this.schoolTypeData?.isKcpePrimarySchool;
		if (!hasProductMenuItems) return [];

		const productMenuItems: MenuItems = {
			title: this.translateService.instant("layout.products"),
			items: []
		};

		if (this.schoolInfo?.hasTimetable) {
			productMenuItems.items.push({
				routerLink: ["/main/timetable"],
				icon: "bi bi-calendar2-week",
				label: this.translateService.instant("layout.timetable")
			});
		}

		productMenuItems.items.push({
			normalLink: "https://zanalytics.page.link/DtUc",
			icon: "bi bi-book-half",
			label: this.translateService.instant("layout.learning"),
			usesNormalLink: true
		});

		return [productMenuItems];
	}

	get otherMenuItems() {
		if (this.schoolTypeData?.isOLevelSchool) return [];

		const otherMenuItems: MenuItems = {
			title: this.translateService.instant("layout.others"),
			items: [
				{
					routerLink: ["/main/opportunities"],
					icon: "bi bi-bookshelf",
					label: this.translateService.instant("layout.opportunities")
				}
			]
		};

		return [otherMenuItems];
	}
}
