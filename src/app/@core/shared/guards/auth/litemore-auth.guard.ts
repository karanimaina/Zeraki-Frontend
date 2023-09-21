import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { AuthService } from "src/app/@core/services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class LitemoreAuthGuard implements CanActivate {
	constructor(private authService: AuthService) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

		const userRoles: LitemoreUserRole[] = this.authService.loggedInUser?.roles?.litemoreRoles;
		if (!userRoles) {
			this.authService.logoutAndRedirect();
		}
		return this.authService.isLoggedIn;

	}
  
}
