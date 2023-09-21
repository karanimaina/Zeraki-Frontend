import { Injectable } from "@angular/core";
import { RetrieveInternalSchoolsPayload } from "../../../models/litemore/school/payload";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";
import { BehaviorSubject } from "rxjs";
import { LitemoreSchoolData } from "../../../models/litemore/school/litemore-school-data";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";

@Injectable({
	providedIn: "root"
})
export class SchoolsDataState {
	constructor(
		private litemoreService: LitemoreService,
		private _reponseHandler: ResponseHandlerService
	) {}

	private readonly _schoolsData$ =
		new BehaviorSubject<LitemoreSchoolData | null>(null);
	private readonly _getSchoolDataStatus$ = new BehaviorSubject<APIStatus>(
		APIStatus.DEFAULT
	);
	private readonly _getSchoolDataMessage$ = new BehaviorSubject<string | null>(
		null
	);
	schoolsData$ = this._schoolsData$.asObservable();
	getSchoolDataStatus$ = this._getSchoolDataStatus$.asObservable();
	getSchoolDataMessage$ = this._getSchoolDataMessage$.asObservable();

	getCurrentSchoolsData(): LitemoreSchoolData | null {
		return this._schoolsData$.value;
	}

	getSchoolsData(payload: RetrieveInternalSchoolsPayload) {
		this._getSchoolDataStatus$.next(APIStatus.LOADING);

		this.litemoreService.getSchools(payload).subscribe({
			next: (response: any) => {
				this._schoolsData$.next(response);
				this._getSchoolDataStatus$.next(APIStatus.SUCCESS);
				this._getSchoolDataMessage$.next("Schools data retrieved successfully");
			},
			error: (error: Error) => {
				this._getSchoolDataMessage$.next(`${error?.message}`);
				this._reponseHandler.error(error, "getSchoolsData()");
				this._getSchoolDataStatus$.next(APIStatus.ERROR);
			}
		});
	}

	get schoolDataMessage(): string | null {
		return this._getSchoolDataMessage$.value;
	}

	resetState() {
		this._schoolsData$.next(null);
		this._getSchoolDataStatus$.next(APIStatus.DEFAULT);
	}
}
