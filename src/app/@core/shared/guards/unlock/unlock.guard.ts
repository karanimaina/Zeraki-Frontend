import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { DataService } from "../../services/data/data.service";

@Injectable({
	providedIn: "root"
})
export class UnlockGuard implements CanActivate {
  
	constructor(private router: Router, private dataService: DataService) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		/**
		 * Check if school is activated for account.
		 * if true. dont do anything.
		 * if false. is student, navigate to student view
		 */
		// let response: boolean = false;
		return this.dataService.userInitSubject.pipe(map(init => {
			// console.warn("init >> ", init);

			if (init) {
				if (init.school_invoice_info && !init.school_invoice_info.account_suspended) {
					console.warn("Account Deactivated unlocked");
					this.router.navigate(["/main"]);
					return false;
				}
				if (init.school_validity_info && !init.school_validity_info.is_valid_school) {
					console.warn("Account Invalid unlocked");
					this.router.navigate(["/main"]);
					return false;
				}
			}
			return true;
		}));
	}

}
