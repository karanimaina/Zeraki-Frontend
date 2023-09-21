import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { LitemoreUserRole } from "../../enums/litemore-user-role";
import { AuthService } from "../../services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class BdevGuard implements CanActivate {

	constructor(
		private authService: AuthService,
	) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot,
	): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		const userRoles: LitemoreUserRole[] = this.authService.loggedInUser?.roles?.litemoreRoles;

		return !userRoles.includes(LitemoreUserRole.SUPER_ADMIN) || !userRoles.includes(LitemoreUserRole.TECH_SUPPORT);
	}

}
