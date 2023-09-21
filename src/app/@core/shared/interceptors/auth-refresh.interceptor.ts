import { Injectable } from "@angular/core";
import {
	HttpRequest,
	HttpHandler,
	HttpEvent,
	HttpInterceptor, HttpErrorResponse
} from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import {catchError, switchMap, tap} from "rxjs/operators";
import { NetworkService } from "../services/network/network.service";
import { HotToastService } from "@ngneat/hot-toast";
import { AuthService } from "../../services/auth/auth.service";

@Injectable()
export class AuthRefreshInterceptor implements HttpInterceptor {
	private isRefreshing;

	constructor(
		private authService: AuthService,
		private networkService: NetworkService,
		private toastService: HotToastService
	) {
		this.authService.isRefreshingToken.subscribe((isRefreshing) => {
			this.isRefreshing = isRefreshing;
		});
	}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		const token = this.authService.loggedInUserToken;

		if (!token || request.url.includes("authenticate_v2") || request.url.includes("googleapis") || request.url.includes("users/check")) {
			return next.handle(request).pipe(catchError((err) => {

				if (!this.networkService.online) {
					this.toastService.info("No internet connection");
				}

				return throwError(err);
			}));
		} else if (token == "Token Expired") {
			return this.handleExpiredToken(request, next);
		} else {
			request = AuthRefreshInterceptor.addTokenHeader(request, token);

			return next.handle(request).pipe(tap(() => { },
				(err: any) => {
					if (err instanceof HttpErrorResponse) {
						console.warn("Failed to complete request>> ", err.status, err.status == 0);
						return;
					}
				}));
		}

	}

	private handleExpiredToken(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		if (!this.isRefreshing) {
			this.authService.setIsRefreshingToken(true);

			const userData = this.authService.loggedInUser;
			if (userData.tokens.refreshToken)
				return this.authService.refreshToken().pipe(
					switchMap((newUser: any) => {
						this.authService.setIsRefreshingToken(false);

						return next.handle(AuthRefreshInterceptor.addTokenHeader(request, newUser.body.access_token));
					}),
					catchError((err) => {
						this.authService.setIsRefreshingToken(false);

						this.authService.logoutAndRedirect();
						return of(err);
					})
				);
		}

		return next.handle(AuthRefreshInterceptor.addTokenHeader(request, this.authService.loggedInUserToken));
	}
	private static addTokenHeader(request: HttpRequest<any>, token: string) {
		return request.clone({ headers: request.headers.set("Authorization", "Bearer " + token) });
	}
}
