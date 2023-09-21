import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subject } from "rxjs";
import CountryDivisionsState from "src/app/@core/services/litemore/states/country-divisions.state";
import CurrentCountryState from "src/app/@core/services/litemore/states/current-country.state";

@Component({
	selector: "app-countries",
	templateUrl: "./countries.component.html",
	styleUrls: ["./countries.component.scss"]
})
export class CountriesComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();


	get currentCountryId(): number | undefined {
		return this.currentCountryState.getCurrentCountry()?.countryId;
	}


	constructor(
    private countryDivisionsState: CountryDivisionsState,
    private currentCountryState: CurrentCountryState,
	) { }

	ngOnInit(): void {
		this.getCountryDivisions();
	}

	private getCountryDivisions() {
		this.countryDivisionsState.retrieveCountryDivisions(<number>this.currentCountryId);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

}
