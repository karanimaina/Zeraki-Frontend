import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { CountryService } from "src/app/@core/shared/services/country/country.service";

@Injectable({ providedIn: "root" })
export default class CurrentCountryState {
	constructor(private readonly _countryService: CountryService) {}

	// get current country
	private readonly _currentCountry$ =
		new BehaviorSubject<CountryProfile | null>(null);
	currentCountry$ = this._currentCountry$.asObservable();

	private setCurrentCountry(): void {
		this._currentCountry$.next(this._countryService.currentCountry);
	}

	getCurrentCountry(): CountryProfile | null {
		return this._countryService.currentCountry;
	}

	get currentCountryId(): number {
		return this._countryService.currentCountry?.countryId as number;
	}

	// change current country
	changeCurrentCountry(country: CountryProfile): void {
		this._countryService.changeCountry(country);
		this.setCurrentCountry();
	}

	resetState() {
		this._currentCountry$.next(null);
	}
}
