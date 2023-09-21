import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { combineLatest, Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { MenuItem } from "../../../@core/models/menu/menu-item";
import { TranslateService } from "@ngx-translate/core";
import { SiteLanguageService } from "../../../@core/shared/services/site-language.service";

@Component({
	selector: "app-print-top-nav",
	templateUrl: "./print-top-nav.component.html",
	styleUrls: ["./print-top-nav.component.scss"]
})
export class PrintTopNavComponent implements OnInit {
	schoolTypeData$: Observable<SchoolTypeData> = this.dataService.schoolData;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	currentLanguage$: Observable<any> = this.siteLanguageService.currentLanguage$;
	userRoles!: Role;
	schoolTypeData!: SchoolTypeData;

	showClassList = true;
	showEvaluationReport = true;

	menuItems: MenuItem[] = [];

	constructor(
		private dataService: DataService,
		private rolesService: RolesService,
		private activatedRoute: ActivatedRoute,
		private translateService: TranslateService,
		private siteLanguageService: SiteLanguageService
	) { }

	ngOnInit(): void {
		this.subscribeToRouteParams();
		this.setMenuItems();
	}

	private subscribeToRouteParams() {
		this.activatedRoute.queryParamMap.subscribe((params) => {
			this.showClassList = params.get("hideClassList") !== "true";
			this.showEvaluationReport = params.get("hideEvaluationReport") !== "true";
		});
	}

	private setMenuItems() {
		combineLatest([this.schoolTypeData$, this.userRoles$, this.currentLanguage$]).subscribe(
			([schoolTypeData, userRoles, currentLanguage]) => {
				this.userRoles = userRoles;
				this.schoolTypeData = schoolTypeData;

				if (schoolTypeData?.isOLevelSchool) {
					this.menuItems = this.olevelMenuItems;
				} else {
					this.menuItems = this.defaultMenuItems;
				}
			}
		);
	}

	private get olevelMenuItems(): MenuItem[] {
		const menuItems: MenuItem[] = [];

		if (this.showClassList && this.userRoles?.isTeacher) {
			menuItems.push({
				routerLink: ["/main/printouts/clists"],
				icon: "bi-list-columns-reverse",
				label: this.translateService.instant("printouts.classList.title")
			});
		}

		if (this.userRoles?.isSchoolAdmin) {
			menuItems.push({
				routerLink: ["/main/printouts/olevels/assessments"],
				icon: "bi-bookshelf",
				label: this.translateService.instant(
					"printouts.oLevelRForm.options.assessments.title"
				)
			});
		}

		if (this.showEvaluationReport && !this.userRoles?.isStudent) {
			menuItems.push({
				routerLink: ["/main/printouts/olevels/evaluation-report"],
				icon: "bi-person-lines-fill",
				label: this.translateService.instant("printouts.evaluationReport.title")
			});
		}

		if (this.userRoles?.isStudent) {
			menuItems.push(this.reportReportFormsMenu);
		}

		if (this.userRoles?.isSchoolAdmin) {
			menuItems.push(this.reportReportFormsMenu);

			menuItems.push({
				routerLink: ["/main/printouts/olevels/merit-list"],
				icon: "bi-list-ol",
				label: this.translateService.instant("printouts.meritList.title")
			});

			menuItems.push({
				routerLink: ["/main/printouts/olevels/transcripts"],
				icon: "bi-list-columns",
				label: this.translateService.instant("printouts.topNav.transcripts")
			});
		}

		return menuItems;
	}

	private get defaultMenuItems(): MenuItem[] {
		if (!this.userRoles?.isSchoolAdmin) return [];

		const menuItems: MenuItem[] = [
			{
				routerLink: ["/main/printouts/clists"],
				icon: "bi-list-columns-reverse",
				label: this.translateService.instant("printouts.classList.title")
			},
			{
				routerLink: ["/main/printouts/analysis"],
				icon: "bi-clipboard-data",
				label: this.translateService.instant("printouts.analysisReport.title")
			},
			{
				routerLink: this.isTanzaniaSchool
					? ["/main/printouts/tz-rform"]
					: ["/main/printouts/rform"],
				icon: "bi-person-lines-fill",
				label: this.translateService.instant("common.rforms")
			},
			{
				routerLink: ["/main/printouts/mlist"],
				icon: "bi-list-ol",
				label: this.translateService.instant(this.isSouthAfricanSchool ? "printouts.meritList.titleMarkSheet" : "printouts.meritList.title")
			},
			{
				routerLink: ["/main/printouts/transcripts"],
				icon: "bi-list-columns",
				label: this.translateService.instant("printouts.topNav.transcripts")
			},
			{
				routerLink: ["/main/printouts/lcerts"],
				icon: "bi-patch-check",
				label: this.translateService.instant("printouts.topNav.leavingCert")
			},
			{
				routerLink: ["/main/printouts/house-lists"],
				icon: "bi-house",
				label: this.translateService.instant("printouts.topNav.houseList")
			}
		];

		return menuItems;
	}

	private get isTanzaniaSchool(): boolean {
		return (
			this.schoolTypeData?.isTanzaniaPrimary ||
			this.schoolTypeData?.isTanzaniaSecondary
		);
	}

	get isSouthAfricanSchool(): boolean {
		return (
			this.schoolTypeData?.isSouthAfricaPrimarySchool
			|| this.schoolTypeData?.isSouthAfricaSecondarySchool
			|| false
		);
	}

	get reportReportFormsMenu() {
		return {
			routerLink: ["/main/printouts/olevels/report-forms"],
			icon: "bi-person-lines-fill",
			label: this.translateService.instant("common.rforms")
		};
	}
}
