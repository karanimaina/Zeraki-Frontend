import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CountryProfile } from "src/app/@core/models/country/country-profile";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";

@Injectable({ providedIn: "root" })
export default class CountryProfilesState {
	constructor(
		private readonly _litemoreService: LitemoreService,
		private readonly _responseHandlerService: ResponseHandlerService,
	) { }

	// Country Profiles
	private readonly _countryProfiles$ = new BehaviorSubject<CountryProfile[] | null>(null);
	private readonly _getCountryProfilesStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getCountryProfilesMessage$ = new BehaviorSubject<string | null>(null);
	countryProfiles$ = this._countryProfiles$.asObservable();
	getCountryProfilesStatus$ = this._getCountryProfilesStatus$.asObservable();
	getCountryProfilesMessage$ = this._getCountryProfilesMessage$.asObservable();

	retrieveCountryProfiles(name?: string): void {
		this._getCountryProfilesStatus$.next(APIStatus.LOADING);

		this._litemoreService.getCountryProfiles(name).subscribe({
			next: (response) => {
				this._countryProfiles$.next(response);
				this._getCountryProfilesStatus$.next(APIStatus.SUCCESS);
				this._getCountryProfilesMessage$.next("countries retrieved successfully");
			},
			error: (error: Error) => {
				this._responseHandlerService.error(error, "retrieveCountryProfiles");
				this._getCountryProfilesStatus$.next(APIStatus.ERROR);
				this._getCountryProfilesMessage$.next("Failed to retrieve countries");
			},
		});
	}

	getCountryProfiles(): CountryProfile[] | null {
		return this._countryProfiles$.value;
	}

	resetState() {
		this._countryProfiles$.next(null);
		this._getCountryProfilesStatus$.next(APIStatus.DEFAULT);
	}
}
