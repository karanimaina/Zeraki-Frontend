import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { LitemoreSchoolTypes } from "src/app/@core/models/litemore-schools";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";

@Injectable({ providedIn: "root" })
export default class SchoolsTypeState {
	constructor(
    private readonly _litemoreService: LitemoreService,
    private readonly _reponseHandler: ResponseHandlerService,
	) { }

	// schools types
	private readonly _schoolsTypes$ = new BehaviorSubject<LitemoreSchoolTypes | null>(null);
	private readonly _getSchoolsTypesStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getSchoolsTypesMessage$ = new BehaviorSubject<string | null>(null);
	schoolsTypes$ = this._schoolsTypes$.asObservable();
	getSchoolsTypesStatus$ = this._getSchoolsTypesStatus$.asObservable();
	getSchoolsTypesMessage$ = this._getSchoolsTypesMessage$.asObservable();

	retrieveSchoolsTypes(): void {
		this._getSchoolsTypesStatus$.next(APIStatus.LOADING);

		this._litemoreService.getSchoolsType().subscribe({
			next: (response) => {
				this._schoolsTypes$.next(response);
				this._getSchoolsTypesStatus$.next(APIStatus.SUCCESS);
				this._getSchoolsTypesMessage$.next("Schools types retrieved successfully");
			},
			error: (error: Error) => {
				this._reponseHandler.error(error, "retrieveSchoolsTypes()");
				this._getSchoolsTypesStatus$.next(APIStatus.ERROR);
			},
		});
	}

	getSchoolsTypes(): LitemoreSchoolTypes | null {
		return this._schoolsTypes$.value;
	}

	resetState() {
		this._schoolsTypes$.next(null);
		this._getSchoolsTypesStatus$.next(APIStatus.DEFAULT);
	}
}
