import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Observable } from "rxjs/internal/Observable";
import { take } from "rxjs/operators";
import { UserInfo } from "src/app/@core/models/user-info";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class UserService {
	private _refreshUserInfo$ = new BehaviorSubject<UserInfo>(null!);
  
	constructor(private http: HttpClient) { }

	setUserInfo(userInfo?: UserInfo) {
		if (userInfo) {
			this._refreshUserInfo$.next(userInfo);
			localStorage.setItem("user-info", JSON.stringify(userInfo));
		} else {
			this.getUserInfo().pipe(take(1)).subscribe((resp: UserInfo) => {
				// console.warn('setSchoolSummary >> ', resp);
				this._refreshUserInfo$.next(resp);
				localStorage.setItem("user-info", JSON.stringify(resp));
			});
		}
	}

	get userInfoSubject() {
		return this._refreshUserInfo$;
	}

	get userInfo() {
		return JSON.parse(localStorage.getItem("user-info")!);
		// return this._refreshUserInfo$.value;
	}

	private getUserInfo(): Observable<any> {
		return this.http.get(`${environment.apiurl}/users/info`);
	}

	// usersInfo$: Observable<UserInfo> = this._refreshUserInfo$
	// 	.pipe(
	// 		switchMapTo(this.getUserInfo()),
	// 		shareReplay(1),
	// 	);

	// resetUserInfo() {
	// 	this._refreshUserInfo$.next(null!);
	// }

	removeUserInfo() {
		this._refreshUserInfo$.next(null!);
		localStorage.removeItem("user-info");
	}

}
