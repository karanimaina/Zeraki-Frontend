import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { MatTableDataSource } from "@angular/material/table";
import { LocalUser } from "src/app/@core/models/user";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { RolesService } from "../../@core/shared/services/role/roles.service";
import { Role } from "../../@core/models/Role";
import { SiteLanguageService } from "src/app/@core/shared/services/site-language.service";
import {
	Language,
	LanguageCode,
	languageList
} from "src/app/@core/shared/utilities/site-language";
import { TranslateService } from "@ngx-translate/core";
import { mergeMap, take, takeUntil } from "rxjs/operators";
import { interval, Observable, Subject } from "rxjs";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { APIStatus } from "src/app/@core/enums/api-status";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { FinanceService } from "src/app/@core/services/finance/finance.service";
import { MessagingService } from "src/app/@core/services/messaging/messaging.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { SummaryService } from "src/app/@core/shared/services/school/summary/summary.service";

@Component({
	selector: "app-top-nav",
	templateUrl: "./top-nav.component.html",
	styleUrls: ["./top-nav.component.scss"]
})
export class TopNavComponent implements OnInit, OnDestroy {
	@Input() networkStatus!: boolean | null;
	@Input() isJointAccount!: boolean;

	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	destroy$: Subject<boolean> = new Subject<boolean>();
	userDp: any;
	searchTerm?: string;
	notifications: any[] = [];
	notsObj: any;
	loggedInUser!: LocalUser;

	userInfo$ = this.userService.userInfoSubject;

	readonly APIStatus = APIStatus;

	loggedInLitemoreUser?: LitemoreUser1;

	constructor(
		private siteLanguageService: SiteLanguageService,
		private dataService: DataService,
		private authService: AuthService,
		private userService: UserService,
		private summaryService: SummaryService,
		private toastService: HotToastService,
		private messagingService: MessagingService,
		private financeService: FinanceService,
		private router: Router,
		private rolesService: RolesService,
		private translate: TranslateService,
		private responseHandler: ResponseHandlerService
	) {
		this.loggedInUser = this.authService.loggedInUser;
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();

		// Used when using angular's interval ie getApiNotificationsUsingSetInterval
		if (this.id) {
			clearInterval(this.id);
		}
	}

	ngOnInit(): void {
		this.getUserInit();
		if (
			this.loggedInUser &&
			(this.loggedInUser.role < 100 || this.loggedInUser.role > 200)
		) {
			this.getNotificationsOnce();
			this.getNotifications();
		}
	}

	getUserInfo() {
		if (
			this.loggedInUser &&
			(this.loggedInUser.role < 100 || this.loggedInUser.role > 200)
		) {
			this.getApiNotifications();
		}
		this.userInfo$.pipe(takeUntil(this.destroy$)).subscribe((val) => {
			// console.warn("userInfo api >> ", val);
			this.userDp = this.dataService.getUserImage(val?.url);
		});
	}

	searchStudent() {
		// console.warn(typeof this.searchTerm, this.searchTerm);
		this.router.navigate(["/main/students/search"], {
			queryParams: { stdNo: this.searchTerm }
		});
		this.searchTerm = undefined;
	}

	getNotificationsOnce() {
		this.messagingService
			.getNotifications()
			.pipe(take(1))
			.subscribe({
				next: (resp: any) => {
					this.dataService.notificationsData.next(resp);
				},
				error: (err) => {
					this.responseHandler.error(err?.error, "getNotificationsOnce()");
				}
			});
	}

	getApiNotifications() {
		interval(120 * 60 * 1000)
			.pipe(
				mergeMap(() => this.messagingService.getNotifications()),
				takeUntil(this.destroy$)
			)
			.subscribe({
				next: (resp: any) => {
					// console.warn("Resp >> ",resp);
					this.dataService.notificationsData.next(resp);
				},
				error: (err) => {
					this.responseHandler.error(err, "getApiNotifications()");
				}
			});
	}

	id: any;
	getApiNotificationsUsingSetInterval() {
		this.id = setInterval(() => {
			this.messagingService
				.getNotifications()
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						// console.warn("Resp >> ", resp);
						this.dataService.notificationsData.next(resp);
					},
					error: (err) => {
						this.responseHandler.error(
							err,
							"getApiNotificationsUsingSetInterval()"
						);
					}
				});
		}, 120 * 60 * 1000);
	}

	getNotifications() {
		this.dataService.notificationsData
			.pipe(takeUntil(this.destroy$))
			.subscribe((resp) => {
				this.notsObj = resp;
				this.notifications = resp?.messagesToDisplay;
			});
	}

	goToMessage(message: any) {
		// console.warn("message >>", message);
		this.router.navigate(["/main/messages/inbox/read", message.messageId]);
	}

	logout() {
		this.authService.logoutAndRedirect().subscribe(() => {
			this.loggedInUser = null!;
			const successMsg = this.translate.instant(
				"layout.top.toastMessages.logoutSuccess"
			);
			this.toastService.success(successMsg);
		});
	}

	markAll() {
		if (this.notsObj?.notificationCount > 0) {
			this.messagingService
				.markAllAsRead()
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					complete: () => {
						this.getApiNotifications();
					}
				});
		} else {
			const message = this.translate.instant(
				"layout.top.toastMessages.noMessagesPreset"
			);
			// this.toastService.info("No messages present");
			this.toastService.info(message);
		}
	}

	/* Language Selection */
	readonly languages = [...languageList];

	get currentLanguage(): Language | null {
		return this.siteLanguageService.getCurrentLanguage();
	}

	switchLanguage(localeCode: LanguageCode) {
		this.siteLanguageService.changeSiteLanguage(localeCode);
		this.siteLanguageService
			.changeUserLanguage(this.loggedInUser.userid, localeCode)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				error: (err) => {
					this.toastService.error(
						this.translate.instant("changeLanguage.error")
					);
				},
				complete: () => {
					this.toastService.success(
						this.translate.instant("changeLanguage.success")
					);
				}
			});
	}

	userInit: any;
	dataSource: any;
	getUserInit() {
		this.dataService.userInitSubject
			.pipe(takeUntil(this.destroy$))
			.subscribe((init) => {
				this.userInit = init;
				this.dataSource = new MatTableDataSource(this.userInit?.schools || []);
				this.getUserInfo();
			});
	}

	filterSchools(event: Event) {
		const inputElement = event.target as HTMLInputElement;
		const filterValue = inputElement.value;

		// console.log("Filter value:", filterValue);

		const filteredSchools = (this.userInit.schools as any[]).filter(
			(school) => {
				return school.name.toLowerCase().includes(filterValue);
			}
		);

		// console.log("Filtered list:", filteredSchools);

		this.dataSource = new MatTableDataSource(filteredSchools);
		inputElement.focus();
	}

	switchSchool(schoolId: number): void {
		this.authService
			.switchSchool(schoolId)
			.pipe(take(1))
			.subscribe({
				next: (resp) => {
					if (resp?.accessToken) {
						this.financeService.resetAllCaches();
						this.toastService.success("School Initialized successfully");
					}
				},
				error: (err) => {
					this.responseHandler.error(err, "switchSchool()");
				},
				complete: () => {
					const userData = JSON.parse(localStorage.getItem("za") || "{}");
					if (Object.keys(userData).length == 0) {
						this.toastService.error("Token not stored!");
						console.warn("Token not stored!");
						return;
					} else {
						this.userService.setUserInfo();
						this.summaryService.setSchoolSummary();
						this.refreshCurrentPage();

						this.toastService.success("School Initialized successfully");
					}
				}
			});
	}

	private refreshCurrentPage() {
		// this.router.navigate([], {
		// 	relativeTo: this.activatedRoute,
		// 	queryParams: { refresh: new Date().getTime() },
		// 	replaceUrl: true,
		// });
		const currentUrl = this.router.url;

		this.router
			.navigateByUrl("/main/switching-school", { skipLocationChange: true })
			.then(() => {
				this.router.navigated = false;
				this.router.navigateByUrl(currentUrl);
			});
	}
}
