import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";

@Injectable({ providedIn: "root" })
export default class CountryDivisionsState {
	constructor(
    private readonly _litemoreService: LitemoreService, private _responseHandler: ResponseHandlerService
	) { }

	// country divisions
	private readonly _countryDivisions$ = new BehaviorSubject<string[] | null>(null);
	private readonly _getCountryDivisionsStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getCountryDivisionsMessage$ = new BehaviorSubject<string | null>(null);
	countryDivisions$ = this._countryDivisions$.asObservable();
	getCountryDivisionsStatus$ = this._getCountryDivisionsStatus$.asObservable();
	getCountryDivisionsMessage$ = this._getCountryDivisionsMessage$.asObservable();

	retrieveCountryDivisions(countryId: number): void {
		this._getCountryDivisionsStatus$.next(APIStatus.LOADING);

		this._litemoreService.getCountryDivisions(countryId).subscribe({
			next: (response) => {
				console.warn("response >> ", response);
				this._countryDivisions$.next(response);
				this._getCountryDivisionsStatus$.next(APIStatus.SUCCESS);
				this._getCountryDivisionsMessage$.next("Country divisions retrieved successfully");
			},
			error: (error: Error) => {
				this._responseHandler.error(error, "retrieveCountryDivisions()");
				this._getCountryDivisionsStatus$.next(APIStatus.ERROR);
				this._getCountryDivisionsMessage$.next("Failed to retrieve country divisions");
			},
		});
	}

	getCountryDivisions(): string[] | null {
		return this._countryDivisions$.value;
	}

	resetState() {
		this._countryDivisions$.next(null);
		this._getCountryDivisionsStatus$.next(APIStatus.DEFAULT);
	}
}
