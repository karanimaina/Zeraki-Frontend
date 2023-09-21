import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { AuthService } from "src/app/@core/services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class FinanceGuard implements CanActivate {
	constructor(private authService: AuthService) {}
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		const userRoles: Role = this.authService.getUserRoles;
		return (userRoles.isPrincipal || userRoles.isStudent);
	}

}
