import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { CountryEducationSystem } from "src/app/@core/models/litemore/country-details/education-system";
import { RetrieveEducationSystemFilters } from "src/app/@core/models/litemore/education-system/payload";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";

@Injectable({ providedIn: "root" })
export default class EducationSystemsState {
	constructor(
    private readonly _litemoreService: LitemoreService,
    private readonly _responseHandlerService: ResponseHandlerService,
	) { }

	// Education Systems
	private readonly _educationSystems$ = new BehaviorSubject<CountryEducationSystem | null>(null);
	private readonly _getEducationSystemsStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getEducationSystemsMessage$ = new BehaviorSubject<string | null>(null);
	educationSystems$ = this._educationSystems$.asObservable();
	getEducationSystemsStatus$ = this._getEducationSystemsStatus$.asObservable();
	getEducationSystemsMessage$ = this._getEducationSystemsMessage$.asObservable();

	retrieveEducationSystems(filters: RetrieveEducationSystemFilters): void {
		this._getEducationSystemsStatus$.next(APIStatus.LOADING);

		this._litemoreService.getEducationSystems(filters).subscribe({
			next: (response) => {
				this._educationSystems$.next(response);
				this._getEducationSystemsStatus$.next(APIStatus.SUCCESS);
				this._getEducationSystemsMessage$.next("Education systems retrieved successfully");
			},
			error: (error: Error) => {
				this._responseHandlerService.error(error, "retrieveEducationSystems()");
				this._getEducationSystemsStatus$.next(APIStatus.ERROR);
				this._getEducationSystemsMessage$.next("Failed to retrieve education system");
			},
		});
	}

	get educationSystems(): CountryEducationSystem | null {
		return this._educationSystems$.value;
	}

	resetState() {
		this._educationSystems$.next(null);
		this._getEducationSystemsStatus$.next(APIStatus.DEFAULT);
	}
}
