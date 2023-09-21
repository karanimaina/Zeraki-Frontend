import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { LitemoreUsersData } from "src/app/@core/models/litemore/users/internal-views-user";
import { RetrieveInternalViewsUsersFilters } from "src/app/@core/models/litemore/users/payloads";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { APIStatus } from "../../../enums/api-status";
import { LitemoreService } from "../litemore.service";

@Injectable({ providedIn: "root" })
export default class UsersListState {
	constructor(
    private readonly _litemoreService: LitemoreService, private _responseHandler: ResponseHandlerService
	) { }

	// users list
	private readonly _usersList$ = new BehaviorSubject<LitemoreUsersData | null>(null);
	private readonly _getUsersListStatus$ = new BehaviorSubject<APIStatus>(APIStatus.DEFAULT);
	private readonly _getUsersListMessage$ = new BehaviorSubject<string | null>(null);
	usersList$ = this._usersList$.asObservable();
	getUsersListStatus$ = this._getUsersListStatus$.asObservable();
	getUsersListMessage$ = this._getUsersListMessage$.asObservable();

	retrieveUsersList(filters: RetrieveInternalViewsUsersFilters): void {
		this._getUsersListStatus$.next(APIStatus.LOADING);

		this._litemoreService.getUsers(filters).subscribe({
			next: (response) => {
				this._usersList$.next(response);
				this._getUsersListStatus$.next(APIStatus.SUCCESS);
				this._getUsersListMessage$.next("users list retrieved successfully");
			},
			error: (error: Error) => {
				this._responseHandler.error(error, "retrieveUsersList()");
				this._getUsersListStatus$.next(APIStatus.ERROR);
				this._getUsersListMessage$.next("Failed to retrieve users list");
			},
		});
	}
	getUsersList(): LitemoreUsersData | null {
		return this._usersList$.value;
	}

	resetState() {
		this._usersList$.next(null);
		this._getUsersListStatus$.next(APIStatus.DEFAULT);
	}

}
