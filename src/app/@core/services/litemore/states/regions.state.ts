import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { RegionsData } from "../../../models/region/region";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { RetrieveRegionsFilters } from "src/app/@core/models/region/payload";

@Injectable({ providedIn: "root" })
export default class RegionsState {
	constructor(
    private readonly _litemoreService: LitemoreService,
    private readonly _reponseHandler: ResponseHandlerService,
	) { }

	// regions
	private readonly _regions$ = new BehaviorSubject<RegionsData | null>(null);
	private readonly _getRegionsStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getRegionsMessage$ = new BehaviorSubject<string | null>(null);
	regions$ = this._regions$.asObservable();
	getRegionsStatus$ = this._getRegionsStatus$.asObservable();
	getRegionsMessage$ = this._getRegionsMessage$.asObservable();

	retrieveRegions(filters: RetrieveRegionsFilters): void {
		this._getRegionsStatus$.next(APIStatus.LOADING);

		this._litemoreService.getRegions(filters).subscribe({
			next: (response) => {
				this._regions$.next(response);
				this._getRegionsStatus$.next(APIStatus.SUCCESS);
				this._getRegionsMessage$.next("Regions retrieved successfully");
			},
			error: (error: Error) => {
				this._reponseHandler.error(error, "retrieveRegions()");
				this._getRegionsStatus$.next(APIStatus.ERROR);
			},
		});
	}

	get regions(): RegionsData | null {
		return this._regions$.value;
	}

	resetState() {
		this._regions$.next(null);
		this._getRegionsStatus$.next(APIStatus.DEFAULT);
	}
}
