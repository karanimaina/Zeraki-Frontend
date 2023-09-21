import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";

@Injectable({
	providedIn: "root" 
})
export class AccountActiveGuard implements CanActivate {


	constructor(private router: Router) { }

	canActivate(
		route: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		/**
		 * Check if school is activated for account.
		 * if true. dont do anything.
		 * if false. is student, navigate to student view
		 */
		// let response: boolean = false;
		const userInit = JSON.parse(localStorage.getItem("user-init-subject")!);
		// console.warn("userInit >>", userInit);
		if (userInit) {
			if (userInit.school_invoice_info && userInit.school_invoice_info.account_suspended) {
				console.log("Account Deactivated");
				this.router.navigate(["/account"]);
				return false;	
			}
			if (userInit.school_validity_info && !userInit.school_validity_info.is_valid_school) {
				console.log("Account Invalid");
				this.router.navigate(["/invalid"]);
				return false;	
			}
		}
		return true;
	}

}
