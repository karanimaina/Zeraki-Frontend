import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CountryDetails } from "../../../models/litemore/country-details/country-details";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Injectable({ providedIn: "root" })
export default class CountryDetailsState {
	constructor(
		private readonly _litemoreService: LitemoreService,
		private readonly _reponseHandler: ResponseHandlerService
	) {}

	// country details
	private readonly _countryDetails$ =
		new BehaviorSubject<CountryDetails | null>(null);
	private readonly _getCountryDetailsStatus$ = new BehaviorSubject<APIStatus>(
		APIStatus.DEFAULT
	);
	private readonly _getCountryDetailsMessage$ = new BehaviorSubject<
		string | null
	>(null);
	countryDetails$ = this._countryDetails$.asObservable();
	getCountryDetailsStatus$ = this._getCountryDetailsStatus$.asObservable();
	getCountryDetailsMessage$ = this._getCountryDetailsMessage$.asObservable();

	retrieveCountryDetails(countryId: number): void {
		this._getCountryDetailsStatus$.next(APIStatus.LOADING);

		this._litemoreService.getCountryDetails(countryId).subscribe({
			next: (response) => {
				this._countryDetails$.next(response);
				this._getCountryDetailsStatus$.next(APIStatus.SUCCESS);
				this._getCountryDetailsMessage$.next(
					"Country Details retrieved successfully"
				);
			},
			error: (error: Error) => {
				this._reponseHandler.error(error, "retrieveCountryDetails()");
				this._getCountryDetailsStatus$.next(APIStatus.ERROR);
			}
		});
	}

	getCountryDetails(): CountryDetails | null {
		return this._countryDetails$.value;
	}

	resetState() {
		this._countryDetails$.next(null);
		this._getCountryDetailsStatus$.next(APIStatus.DEFAULT);
	}
}
