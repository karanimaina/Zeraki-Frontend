import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { RetrieveSubCountyFilters } from "src/app/@core/models/country/county/payload";
import { CountryService } from "src/app/@core/shared/services/country/country.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";

@Injectable({ providedIn: "root" })
export default class SubCountiesState {
	constructor(
		private readonly _countryService: CountryService,
		private readonly _responseHandlerService: ResponseHandlerService
	) {}

	// Region Counties
	private readonly _subCounties$ = new BehaviorSubject<any>(null);
	private readonly _getSubCountiesStatus$ = new BehaviorSubject<APIStatus>(
		APIStatus.DEFAULT
	);
	private readonly _getSubCountiesMessage$ = new BehaviorSubject<string | null>(
		null
	);
	subCounties$ = this._subCounties$.asObservable();
	getSubCountiesStatus$ = this._getSubCountiesStatus$.asObservable();
	getSubCountiesMessage$ = this._getSubCountiesMessage$.asObservable();

	retrieveSubCounties(filters: RetrieveSubCountyFilters): void {
		this._getSubCountiesStatus$.next(APIStatus.LOADING);

		this._countryService.getSubCounties(filters).subscribe({
			next: (response: any) => {
				this._subCounties$.next(response?.subCounties);
				this._getSubCountiesStatus$.next(APIStatus.SUCCESS);
				this._getSubCountiesMessage$.next("Counties retrieved successfully");
			},
			error: (error: Error) => {
				this._responseHandlerService.error(error, "retrieveRegionCounties()");
				this._getSubCountiesStatus$.next(APIStatus.ERROR);
				this._getSubCountiesMessage$.next("Failed to retrieve counties");
			}
		});
	}

	resetState() {
		this._subCounties$.next(null);
		this._getSubCountiesStatus$.next(APIStatus.DEFAULT);
	}
}
