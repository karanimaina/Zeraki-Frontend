import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class NotStudentGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		const user = this.authService.loggedInUser;
		// console.warn(user.userid, typeof user.userid);
		// const user.roles = user.roles;

		if (user.roles.isStudent) {
			this.router.navigateByUrl(`/main/students/analytics/${user.userid}`);
			return false;
		}

		return !user.roles.isStudent;
	}

}
