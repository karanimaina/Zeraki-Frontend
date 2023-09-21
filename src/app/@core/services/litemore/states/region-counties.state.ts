import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CountyData } from "src/app/@core/models/country/county/county";
import { RetrieveRegionCountyFilters } from "src/app/@core/models/country/county/payload";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";

@Injectable({ providedIn: "root" })
export default class RegionCountiesState {
	constructor(
    private readonly _litemoreService: LitemoreService,
    private readonly _responseHandlerService: ResponseHandlerService,
	) { }

	// Region Counties
	private readonly _regionCounties$ = new BehaviorSubject<CountyData | null>(null);
	private readonly _getRegionCountiesStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getRegionCountiesMessage$ = new BehaviorSubject<string | null>(null);
	regionCounties$ = this._regionCounties$.asObservable();
	getRegionCountiesStatus$ = this._getRegionCountiesStatus$.asObservable();
	getRegionCountiesMessage$ = this._getRegionCountiesMessage$.asObservable();

	retrieveRegionCounties(filters: RetrieveRegionCountyFilters): void {
		this._getRegionCountiesStatus$.next(APIStatus.LOADING);

		this._litemoreService.getRegionCounties(filters).subscribe({
			next: (response) => {
				this._regionCounties$.next(response);
				this._getRegionCountiesStatus$.next(APIStatus.SUCCESS);
				this._getRegionCountiesMessage$.next("Counties retrieved successfully");
			},
			error: (error: Error) => {
				this._responseHandlerService.error(error, "retrieveRegionCounties()");
				this._getRegionCountiesStatus$.next(APIStatus.ERROR);
				this._getRegionCountiesMessage$.next("Failed to retrieve counties");
			},
		});
	}

	get regionCounties(): CountyData | null {
		return this._regionCounties$.value;
	}

	resetState() {
		this._regionCounties$.next(null);
		this._getRegionCountiesStatus$.next(APIStatus.DEFAULT);
	}
}
