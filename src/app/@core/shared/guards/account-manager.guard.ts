import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { LitemoreUserRole } from "../../enums/litemore-user-role";
import { AuthService } from "../../services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class AccountManagerGuard implements CanActivate {

	constructor(
		private authService: AuthService,
		private router: Router,
	) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		const userRoles: LitemoreUserRole[] = this.authService.loggedInUser?.roles?.litemoreRoles;

		if (!userRoles.includes(LitemoreUserRole.SUPER_ADMIN)) {
			if (userRoles.includes(LitemoreUserRole.TECH_SUPPORT)) {
				return true;
			}

			return this.router.parseUrl("/litemore/am");
		}

		return true;
	}

}
