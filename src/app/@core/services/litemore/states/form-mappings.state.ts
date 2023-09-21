import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { FormMapping } from "src/app/@core/models/litemore/form-mapping/form-mapping";
import { RetrieveFormMappingFilters } from "src/app/@core/models/litemore/form-mapping/payload";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";

@Injectable({ providedIn: "root" })
export default class FormMappingsState {
	constructor(
    private readonly _litemoreService: LitemoreService,
    private readonly _responseHandlerService: ResponseHandlerService,
	) { }

	// Form Mappings
	private readonly _formMappings$ = new BehaviorSubject<FormMapping | null>(null);
	private readonly _getFormMappingsStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getFormMappingsMessage$ = new BehaviorSubject<string | null>(null);
	formMappings$ = this._formMappings$.asObservable();
	getFormMappingsStatus$ = this._getFormMappingsStatus$.asObservable();
	getFormMappingsMessage$ = this._getFormMappingsMessage$.asObservable();

	retrieveFormMappings(filters: RetrieveFormMappingFilters): void {
		this._getFormMappingsStatus$.next(APIStatus.LOADING);

		this._litemoreService.getFormMappings(filters).subscribe({
			next: (response) => {
				this._formMappings$.next(response);
				this._getFormMappingsStatus$.next(APIStatus.SUCCESS);
				this._getFormMappingsMessage$.next("Form mappings retrieved successfully");
			},
			error: (error: Error) => {
				this._responseHandlerService.error(error, "retrieveFormMappings()");
				this._getFormMappingsStatus$.next(APIStatus.ERROR);
				this._getFormMappingsMessage$.next("Failed to retrieve form mappings");
			},
		});
	}

	get formMappings(): FormMapping | null {
		return this._formMappings$.value;
	}

	resetState() {
		this._formMappings$.next(null);
		this._getFormMappingsStatus$.next(APIStatus.DEFAULT);
	}
}
