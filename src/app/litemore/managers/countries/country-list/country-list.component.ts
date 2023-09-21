import { Component, OnInit, OnDestroy } from "@angular/core";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subject, Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import CountryProfilesState from "src/app/@core/services/litemore/states/country-profiles.state";
import { APIStatus } from "src/app/@core/enums/api-status";
import Swal from "sweetalert2";
import {Router} from "@angular/router";

@Component({
	selector: "app-country-list",
	templateUrl: "./country-list.component.html",
	styleUrls: ["./country-list.component.scss"]
})
export class CountryListComponent implements OnInit, OnDestroy {
	readonly APIStatus = APIStatus;
	destroy$: Subject<boolean> = new Subject<boolean>();

	getCountryProfilesStatus$: Observable<APIStatus | null> = this.countryProfilesState.getCountryProfilesStatus$;

	countries: CountryProfile[] = [];

	dataSource: MatTableDataSource<CountryProfile> = new MatTableDataSource();

	searchForm = this.fb.group({
		searchTerm: [""],
	});
	get searchTerm(): AbstractControl | null {
		return this.searchForm.get("searchTerm");
	}

	constructor(
		private litemoreService: LitemoreService,
		private translate: TranslateService,
		private toastService: HotToastService,
		private fb: FormBuilder,
		private countryProfilesState: CountryProfilesState,
		private router:Router
	) { }

	ngOnInit(): void {
		this.subscribeToCountryProfiles();
	}

	private subscribeToCountryProfiles() {
		this.countryProfilesState.countryProfiles$.pipe(takeUntil(this.destroy$)).subscribe({
			next: (countries) => {
				if (countries) this.dataSource = new MatTableDataSource(countries);
			},
			error: () => {
				this.toastService.error(this.translate.instant("litemore.managers.countries.pages.countryList.failedToDeleteCountry"));
			},
		});
	}

	submitSearchForm() {
		this.searchForm.markAllAsTouched();
		if (this.searchForm.invalid) return;

		this.fetchCountries();
	}

	resetSearchForm() {
		this.searchForm.reset({ searchTerm: "" });
		this.fetchCountries();
	}

	private fetchCountries() {
		this.countryProfilesState.retrieveCountryProfiles(this.searchTerm?.value);
	}

	addCountry() {
		this.router.navigate(["/litemore/mg/countries/add"]);
	}

	async confirmCountryDeletion(country: CountryProfile, index: number) {
		const title = this.translate.instant("litemore.managers.countries.pages.countryList.countryDeletion.title");
		const text = this.translate.instant("litemore.managers.countries.pages.countryList.countryDeletion.text",{
			countryName:country.name
		});

		const result = await Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("litemore.managers.countries.pages.countryList.countryDeletion.yes"),
			cancelButtonText: this.translate.instant("litemore.managers.countries.pages.countryList.countryDeletion.no"),
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			focusCancel: true,
			focusConfirm: false,
		});

		if (result.isConfirmed) {
			this.deleteCountry(country, index);
		}
	}

	editCountry(country) {
		this.router.navigate(["/litemore/mg/countries/"+country.countryId,"edit"]);
	}

	viewCountry(country	) {
		this.router.navigate(["/litemore/mg/countries/",country.countryId]);
	}

	private deleteCountry(country: CountryProfile, index: number) {
		this.litemoreService.deleteCountryProfile(country.countryId).pipe(takeUntil(this.destroy$)).subscribe({
			next: (res: any) => {
				this.dataSource.filteredData.splice(index, 1);
				this.toastService.success(res.response.message);
			},
			error: (error: any) => {
				console.error(error);
				this.toastService.error(this.translate.instant("litemore.managers.countries.pages.countryList.failedToDeleteCountry"));
			}
		});
	}

	clearCache() {
		this.litemoreService.clearCache().pipe(takeUntil(this.destroy$)).subscribe({
			next: () => {
				const msg = this.translate.instant("common.toastMessages.cacheCleared");
				this.toastService.success(msg);
			},
			error: () => {
				const msg = this.translate.instant("common.toastMessages.cacheClearedError");
				this.toastService.error(msg);
			}
		});
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
