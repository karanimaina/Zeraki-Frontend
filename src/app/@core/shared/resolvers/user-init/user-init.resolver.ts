import { Injectable } from "@angular/core";
import { Resolve,
	RouterStateSnapshot,
	ActivatedRouteSnapshot
} from "@angular/router";
import { Observable } from "rxjs";
import { UserInit } from "src/app/@core/models/user_init";
import { DataService } from "../../services/data/data.service";

@Injectable({
	providedIn: "root"
})
export class UserInitResolver implements Resolve<UserInit> {
	constructor(private dataService: DataService){}
	resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<UserInit> {

		return this.dataService.userInitSubject;

	}
}
