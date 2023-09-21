import { Component, OnInit, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { APIStatus } from "src/app/@core/enums/api-status";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { LitemoreSchoolTypes } from "src/app/@core/models/litemore-schools";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import SchoolsTypeState from "src/app/@core/services/litemore/states/schools-type.state";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";

interface SchoolTypesNavItem {
	name: string;
	routerLinkURL: string;
}

@Component({
	selector: "app-schools-type-nav-list",
	templateUrl: "./schools-type-nav-list.component.html",
	styleUrls: ["./schools-type-nav-list.component.scss"]
})
export class SchoolsTypeNavListComponent implements OnInit, OnDestroy {
	readonly LitemoreUserRole = LitemoreUserRole;
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	schoolTypesNavItems: SchoolTypesNavItem[] = [];

	getSchoolsDataStatus$: Observable<APIStatus | null> = this.schoolsTypeState.getSchoolsTypesStatus$;
	schoolsTypes$: Observable<LitemoreSchoolTypes | null> = this.schoolsTypeState.schoolsTypes$;

	defaultPath$?: any;
	litemoreUser?: LitemoreUser1;

	get litemorePathSuffix(): string {
		return  this.litemoreUser?.isAdminOrTechSupport ? "mg" : "am";
	}

	get defaultSchoolsRouterLink(): string {
		if (this.schoolTypesNavItems.length > 0) {
			return `/litemore/${this.litemorePathSuffix}/schools`;
		}

		return "";
	}

	constructor(
		private schoolsTypeState: SchoolsTypeState,
		private litemoreUserService: LitemoreUserService,
	) { }

	ngOnInit(): void {
		this.getDefaultPath();
	}

	private getDefaultPath() {
		this.defaultPath$ = this.litemoreUserService.litemoreUser$.subscribe(user => {
			if (user) {
				this.litemoreUser = this.litemoreUserService.initLitemoreUser(user);
				this.getZerakiProducts();
			}
		});
	}

	private getZerakiProducts() {
		this.schoolsTypes$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (schoolsTypes) => {
				if (schoolsTypes) {
					const schoolTypesNavItems = schoolsTypes.zerakiProducts.map(item => {
						const schoolTypesNavItem: SchoolTypesNavItem = {
							name: item,
							routerLinkURL: `/litemore/${this.litemorePathSuffix}/schools/type/${item}`,
						};

						return schoolTypesNavItem;
					});

					this.schoolTypesNavItems = schoolTypesNavItems;
				}

			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
