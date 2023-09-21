import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";
import { SummaryService } from "../../services/school/summary/summary.service";

@Injectable({
	providedIn: "root"
})
export class SetupCompleteGuard implements CanActivate {
	constructor(private summaryService: SummaryService, private router: Router) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {

		const summary = this.summaryService.schoolSummary;
		if (summary?.classes > 0) {
			return true;
		}

		this.router.navigateByUrl("/setup");

		return false;
	}

}
