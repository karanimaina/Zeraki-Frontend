import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";

@Injectable({ providedIn: "root" })
export default class RolesState {
	constructor(
    private readonly _litemoreService: LitemoreService, private _responseHandler: ResponseHandlerService
	) { }

	// roles
	private readonly _roles$ = new BehaviorSubject<string[] | null>(null);
	private readonly _getRolesStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getRolesMessage$ = new BehaviorSubject<string | null>(null);
	roles$ = this._roles$.asObservable();
	getRolesStatus$ = this._getRolesStatus$.asObservable();
	getRolesMessage$ = this._getRolesMessage$.asObservable();

	retrieveRoles(): void {
		this._getRolesStatus$.next(APIStatus.LOADING);

		this._litemoreService.getInternalViewsRoles().subscribe({
			next: (response) => {
				this._roles$.next(response);
				this._getRolesStatus$.next(APIStatus.SUCCESS);
				this._getRolesMessage$.next("Roles retrieved successfully");
			},
			error: (error: Error) => {
				this._responseHandler.error(error, "retrieveRoles()");
				this._getRolesStatus$.next(APIStatus.ERROR);
				this._getRolesMessage$.next("Failed to retrieve roles");
			},
		});
	}

	getRoles(): string[] | null {
		return this._roles$.value;
	}

	resetState() {
		this._roles$.next(null);
		this._getRolesStatus$.next(APIStatus.DEFAULT);
	}
}
