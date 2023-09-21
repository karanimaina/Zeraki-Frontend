import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";
import { Role } from "../../../models/Role";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { take } from "rxjs/operators";

@Injectable({
	providedIn: "root"
})
export class RolesService {
	private _roleSubject$= new BehaviorSubject<Role>(null!);

	constructor(private http: HttpClient) {}

	public get roleValue(): Role {
		return this._roleSubject$.value;
	}

	get roleSubject() {
		return this._roleSubject$;
	}

	public get isNormalTeacher(): boolean {
		return this.roleValue?.isTeacher && !this.roleValue?.isSchoolAdmin;
	}

	setUserRoles(userRoles?: Role) {
		if (userRoles) {
			this._roleSubject$.next(userRoles);
		}else {
			this.getUserRoles().pipe(take(1)).subscribe(val => {
				localStorage.setItem("user-role",JSON.stringify(val));
				this._roleSubject$.next(val);
			});
		}
	}

	getUserRoles(): Observable<any> {
		return this.http.get(`${environment.apiurl}/users/roles`);
	}

	removeRoles() {
		localStorage.removeItem("user-role");
		this._roleSubject$.next(null!);
		// this._roleSubject.unsubscribe();
	}

}
