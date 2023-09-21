import { Component, OnInit } from "@angular/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { combineLatest, Observable } from "rxjs";
import { Role } from "../../../@core/models/Role";
import { TranslateService } from "@ngx-translate/core";
import { SiteLanguageService } from "../../../@core/shared/services/site-language.service";
import { MenuItem } from "../../../@core/models/menu/menu-item";

@Component({
	selector: "app-classes-top-nav",
	templateUrl: "./classes-top-nav.component.html",
	styleUrls: ["./classes-top-nav.component.scss"]
})
export class ClassesTopNavComponent implements OnInit {
	schoolTypeData$: Observable<SchoolTypeData> = this.dataService.schoolData;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	currentLanguage$: Observable<any> = this.siteLanguageService.currentLanguage$;
	userRoles!: Role;
	schoolTypeData!: SchoolTypeData;
	menuItems: MenuItem[] = [];

	constructor(
		private dataService: DataService,
		private rolesService: RolesService,
		private translateService: TranslateService,
		private siteLanguageService: SiteLanguageService
	) { }

	ngOnInit(): void {
		this.setMenuItems();
	}

	private setMenuItems() {
		combineLatest([this.schoolTypeData$, this.userRoles$, this.currentLanguage$]).subscribe(
			([schoolTypeData, userRoles, currentLanguage]) => {
				this.userRoles = userRoles;
				this.schoolTypeData = schoolTypeData;

				this.menuItems = this.getMenuItems;
			}
		);
	}

	private get getMenuItems(): MenuItem[] {
		const manageLabel = this.userRoles?.isSchoolAdmin
			? this.translateService.instant("classes.topNav.manageClasses")
			: this.translateService.instant("classes.topNav.allClasses");

		const menuItems: MenuItem[] = [
			{
				routerLink: ["/main/classes/myclass"],
				icon: "bi-buildings",
				label: this.translateService.instant("classes.topNav.myClasses")
			},
			{
				routerLink: ["/main/classes/manage"],
				icon: "bi-gear-wide-connected",
				label: manageLabel
			}
		];

		if (this.schoolTypeData?.isOLevelSchool && this.userRoles?.isSchoolAdmin) {
			menuItems.push(this.subjectMenuItem);
		}

		if (this.userRoles?.isSchoolAdmin) {
			menuItems.push(this.addNewClassMenuItem);
		}

		return menuItems;
	}

	private get subjectMenuItem(): MenuItem {
		return {
			routerLink: ["/main/classes/olevel/subjects"],
			icon: "bi-bookshelf",
			label: this.translateService.instant("classes.topNav.manageSubjects")
		};
	}

	private get addNewClassMenuItem(): MenuItem {
		return {
			routerLink: ["/main/classes/add"],
			icon: "bi-node-plus",
			label: this.translateService.instant("classes.topNav.addNewClass")
		};
	}

}
