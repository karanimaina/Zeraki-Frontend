import {Injectable} from "@angular/core";
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from "@angular/router";
import { AuthService } from "../../services/auth/auth.service";

@Injectable({
	providedIn: "root"
})
export class LoginGuard implements CanActivate {
	constructor(private authService: AuthService) { }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
		return !this.authService.isLoggedIn;
	}
}
