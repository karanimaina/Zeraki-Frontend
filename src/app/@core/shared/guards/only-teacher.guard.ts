import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class OnlyTeacherGuard implements CanActivate {
	constructor(private authService: AuthService) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		const userRoles = this.authService.loggedInUser.roles;
		return userRoles.isTeacher;
	}

}
