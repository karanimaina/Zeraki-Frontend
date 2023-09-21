import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ReplaySubject, Subject } from "rxjs";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { environment } from "src/environments/environment";

@Injectable({
	providedIn: "root"
})
export class LitemoreUserService {
	private _litemoreUserSubject$: Subject<LitemoreUser1> =
		new ReplaySubject<LitemoreUser1>(1);
	litemoreUserObs$ = this._litemoreUserSubject$.asObservable();

	userRoles: LitemoreUserRole[] = this.litemoreUser?.litemoreRoles;

	constructor(private http: HttpClient) {}

	getLitemoreUserApi() {
		return this.http.get<LitemoreUser1>(
			`${environment.apiurl}/internal/user/profile`
		);
	}

	setLitemoreUser(user?: LitemoreUser1) {
		if (user) {
			this._litemoreUserSubject$.next(this.initLitemoreUser(user));
			localStorage.setItem(
				"user-info",
				JSON.stringify(this.initLitemoreUser(user))
			);
		} else {
			this.getLitemoreUserApi().subscribe((resp) => {
				this._litemoreUserSubject$.next(this.initLitemoreUser(resp));
				localStorage.setItem(
					"user-info",
					JSON.stringify(this.initLitemoreUser(resp))
				);
			});
		}
	}

	initLitemoreUser(user: LitemoreUser1): LitemoreUser1 {
		return new LitemoreUser1(
			user.userId,
			user.phoneNumber,
			user.name,
			user.email,
			user.countyId,
			user.countyName,
			user.countryId,
			user.countryName,
			user.regionName,
			user.regionId,
			user.litemoreRoles,
			user.managedRegionsIds || []
		);
	}

	get litemoreUser$() {
		return this._litemoreUserSubject$;
	}

	get litemoreUser() {
		return JSON.parse(localStorage.getItem("user-info")!);
	}

	updateUser(payload: any) {
		return this.http.put(`${environment.apiurl}/internal/user`, payload);
	}

	resetLitemoreUser() {
		this._litemoreUserSubject$.next();
		localStorage.removeItem("user-info");
	}
}
