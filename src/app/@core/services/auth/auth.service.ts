import { HttpClient, HttpHeaders, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NavigationEnd, NavigationStart, Router } from "@angular/router";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AppInjector } from "src/app/app.module";
import { environment } from "src/environments/environment";
import { Role } from "../../models/Role";
import { LocalUser } from "../../models/user";
import { CountryService } from "../../shared/services/country/country.service";
import { DataService } from "../../shared/services/data/data.service";
import { RolesService } from "../../shared/services/role/roles.service";
import { SummaryService } from "../../shared/services/school/summary/summary.service";
import { TokenStorageService } from "../../shared/services/token/token-storage.service";
import { UserService } from "../../shared/services/user/user.service";
import { LanguageCode } from "../../shared/utilities/site-language";
import { StateResetsService } from "../litemore/states/state-resets.service";
import { LitemoreUserService } from "../litemore/user/litemore-user.service";

@Injectable({
	providedIn: "root"
})
export class AuthService {
	isRefreshingToken$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
    private http: HttpClient,
    private router: Router,
    private summaryService: SummaryService,
	private userService: UserService,
    private dataService: DataService,
    private rolesService: RolesService,
    private tokenService: TokenStorageService,
	private litemoreUserService: LitemoreUserService
	) { }

	get isRefreshingToken() {
		return this.isRefreshingToken$.asObservable();
	}

	setIsRefreshingToken(value: boolean) {
		this.isRefreshingToken$.next(value);
	}


	resetCodeAnalytics(username: string, phone: string, languageCode?: LanguageCode) {
		const data = { username: username, phone: phone };
		if (languageCode) {
			return this.http.post(`${environment.apiurl}/users/check/phone?forgot_password=true&language=${languageCode}`, data);
		}
		return this.http.post(`${environment.apiurl}/users/check/phone?forgot_password=true`, data);
	}

	sendResetCodeAnalytics(username: string, code: string, password: string) {
		return this.http.get(`${environment.apiurl}/users/changepassword?e=${username}&c=${code}&p=${password}`);
	}

	forgotPasswordAnalytics(usernameObj: any, languageCode?: LanguageCode) {
		if (languageCode) {
			return this.http.post(`${environment.apiurl}/users/check?forgot_password=true&language=${languageCode}`, usernameObj);
		}
		return this.http.post(`${environment.apiurl}/users/check?forgot_password=true`, usernameObj);
	}

	loginUser(username: string, password: string): Observable<HttpResponse<any>> {

		const details = { username: username, password: password };

		let formBody: any = [];
		for (const property in details) {
			const encodedKey = encodeURIComponent(property);
			const encodedValue = encodeURIComponent(details[property]);
			formBody.push(encodedKey + "=" + encodedValue);
		}
		formBody = formBody.join("&");

		return this.http.post(`${environment.baseUrl}/authenticate_v2`, formBody, { observe: "response", headers: new HttpHeaders({ "Content-Type": "application/x-www-form-urlencoded" }) });
	}


	refreshToken() {
		const userData = this.tokenService.getUserData();
		return this.http.post(`${environment.apiurl}/authentication/refresh-token?refreshToken=${userData.tokens.refreshToken}`, null, { observe: "response" })


			.pipe(tap((resData: any) => {
				const user = this.loggedInUser;

				user["tokens"] = resData.body.tokens;

				this.setLocalUser(user);
			}));
	}


	switchSchool(schoolId: number) {
		return this.http.post(`${environment.apiurl}/users/init/${schoolId}`, null, { observe: "response" }).pipe(tap({
			next: (resData: any) => {
				const user = this.loggedInUser;

				user["tokens"] = resData.body.tokens;

				this.setLocalUser(user);

				this.dataService.setSchoolTypeData();
				this.rolesService.setUserRoles();
			}
		}));
	}

	setLocalUser(user: LocalUser) {
		localStorage.setItem("za", JSON.stringify(user));
	}

	get isLoggedIn(): boolean {
		return !!(this.loggedInUserToken || this.loggedInUserToken=="Token Expired");
	}

	get loggedInUser(): LocalUser {
		return JSON.parse(localStorage.getItem("za")!);
	}

	get getUserRoles(): Role {
		return JSON.parse(localStorage.getItem("user-role")!);
	}

	get loggedInUserToken(): string {
		const loggedInUser = this.loggedInUser;

		if (!loggedInUser || !loggedInUser.tokens || !loggedInUser.tokens.expiresAt) {
			return null!;
		} else if (!this.isRefreshingToken$.value && loggedInUser.tokens.expiresAt && new Date().getTime() > loggedInUser.tokens.expiresAt) {
			// Token expired
			return "Token Expired";
		} else
			return loggedInUser.tokens.accessToken;
	}


	autoLoginAnalytics() {
		if (!this.loggedInUser || !this.loggedInUserToken || this.loggedInUserToken === "Token Expired") {
			this.router.navigate(["auth"]);
		} else {
			this.router.events.subscribe((event) => {
				if ((event instanceof NavigationStart && event.url === "/") || (event instanceof NavigationEnd && event.url === "/auth")) {
					// console.warn('event.url >> ', event.url)
					const route = JSON.parse(localStorage.getItem("route") || "{}");
					if (route && Object.keys(route).length != 0 ) {
						this.router.navigateByUrl(`/${route}`);
					} else {
						this.router.navigateByUrl("/main");
					}

				}
			});
		}
	}

	forgotUsernameAnalytics(phone: string, languageCode?: LanguageCode) {
		if (languageCode) {
			return this.http.post(`${environment.apiurl}/users/forgotusername?language=${languageCode}`, { forgotusername_phone: phone }, { headers: new HttpHeaders({ "content-type": "application/json" }), responseType: "json" });
		}
		return this.http.post(`${environment.apiurl}/users/forgotusername`, { forgotusername_phone: phone }, { headers: new HttpHeaders({ "content-type": "application/json" }), responseType: "json" });
	}

	checkUserExists(username: any): Observable<any> {
		return this.http.post(`${environment.apiurl}/users/check`, { username: username }, { headers: new HttpHeaders({ "content-type": "application/json" }), observe: "response", responseType: "json" });
	}

	resetAppData() {
		const stateResetsService = AppInjector.get(StateResetsService);
		stateResetsService.resetAllStateData();
		this.litemoreUserService.resetLitemoreUser();

		this.rolesService.removeRoles();
		this.userService.removeUserInfo();
		this.dataService.removeUserInit();
		this.dataService.removeNotification();
		this.summaryService.resetSchoolSummary();
		const countryService = AppInjector.get(CountryService);
		countryService.removeCountry();
	}

	logoutAndRedirect() {
		this.router.navigate(["auth"]);
		localStorage.removeItem("za");
		this.resetAppData();


		// If you want to show success message after logout,
		return new Observable(observer => {
			observer.next(true);
			observer.complete();
		});

		// Roles
		// Info
		// SchoolTypeData
		// init

	}
}

