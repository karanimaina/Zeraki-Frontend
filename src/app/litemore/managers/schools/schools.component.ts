import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { forkJoin, Observable, of, Subject } from "rxjs";
import { catchError, takeUntil } from "rxjs/operators";
import { LitemoreSchoolTypes } from "src/app/@core/models/litemore-schools";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import SchoolsTypeState from "src/app/@core/services/litemore/states/schools-type.state";
import { APIStatus } from "src/app/@core/enums/api-status";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";
import RegionCountiesState from "src/app/@core/services/litemore/states/region-counties.state";

@Component({
	selector: "app-schools",
	template: "<router-outlet></router-outlet>",
	styleUrls: ["./schools.component.scss"]
})

export class SchoolsComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();
	schoolsTypes$: Observable<LitemoreSchoolTypes | null> = this.schoolsTypeState.schoolsTypes$;


	constructor(
		private litemoreService: LitemoreService,
		private litemoreUserService: LitemoreUserService,
		private schoolsTypeState: SchoolsTypeState,
		private regionCountiesState: RegionCountiesState,
		private currentCountryState: CurrentCountryState,
		private router: Router
	) { }

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	ngOnInit(): void {
		this.subscribeToCurrentCountry();
		this.getDefaultRoute();
	}

	private getDefaultRoute() {
		this.litemoreUserService.litemoreUser$.subscribe(user => {
			if (user) {
				const litemoreUser: LitemoreUser1 = this.litemoreUserService.initLitemoreUser(user);

				forkJoin([
					this.litemoreService.getZerakiPartners().pipe(catchError(e => of(e))),
					this.litemoreService.getZerakiAccountManagers().pipe(catchError(e => of(e))),
				]).pipe(takeUntil(this.destroy$)).subscribe(([
					patners,
					accountManagers
				]) => {
					this.litemoreService.partners.next(patners);
					this.litemoreService.account_managers.next(accountManagers);
					this.schoolsTypes$.pipe(takeUntil(this.destroy$)).subscribe({
						next: (schoolsTypes) => {
							if (schoolsTypes) this.router.navigate([`/litemore/${litemoreUser.defaultRoute}/schools/type`, schoolsTypes?.zerakiProducts[0]]);
						},
					});
				});
			}
		});
	}

	private subscribeToCurrentCountry() {
		this.currentCountryState.currentCountry$
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (currentCountry) => {
					if (currentCountry) {
						this.fetchCounties();
					}
				}
			});
	}

	private fetchCounties() {
		this.regionCountiesState.retrieveRegionCounties({
			countryId: this.currentCountryState.currentCountryId,
			download: true
		});
	}
}
