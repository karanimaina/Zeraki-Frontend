import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivateChild, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { NetworkService } from "../../services/network/network.service";

@Injectable({
	providedIn: "root"
})
export class NetworkGuard implements CanActivateChild {
	constructor(private networkService: NetworkService){}
  
	canActivateChild(
		childRoute: ActivatedRouteSnapshot,
		state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
		if (!this.networkService.online) {
			this.networkService.isNetworkStopped = true;
		}
		// console.warn("this.networkService.online >> ", this.networkService.online);
		// console.warn("this.networkService.isNetworkStopped >> ", this.networkService.isNetworkStopped);
		return true;
	}
  
}
