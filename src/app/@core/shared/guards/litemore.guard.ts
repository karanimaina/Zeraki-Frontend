import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { AuthService } from "../../services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class LitemoreGuard implements CanActivate {
	constructor(private router: Router, private authService: AuthService) { }
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		const userRoleNumber = this.authService.loggedInUser.role;

		if (userRoleNumber != 100) {
			return this.router.navigate(["/litemore/am"]);
		}

		return this.router.navigate(["/litemore/mg"]);
	}

}
