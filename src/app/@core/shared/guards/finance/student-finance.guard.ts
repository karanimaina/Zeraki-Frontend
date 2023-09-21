import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { AuthService } from "src/app/@core/services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class StudentFinanceGuard implements CanActivate {
	constructor(private authService: AuthService, private router: Router) { }
	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

		const userRoles: Role = this.authService.getUserRoles;

		if (userRoles?.isStudent) {
			this.router.navigateByUrl("/main/finance/student");
			return false;
		}
		return true;
	}

}
