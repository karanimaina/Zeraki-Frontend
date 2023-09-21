import { AfterViewInit, Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { DeviceDetectorService } from "ngx-device-detector";
import { OwlOptions } from "ngx-owl-carousel-o";
import { take, takeUntil } from "rxjs/operators";
import { DataService } from "../@core/shared/services/data/data.service";
import { RolesService } from "../@core/shared/services/role/roles.service";
import { SiteLanguageService } from "../@core/shared/services/site-language.service";
import { Language, LanguageCode, languageList } from "../@core/shared/utilities/site-language";
import { LocalUser } from "../@core/models/user";
import Swal from "sweetalert2";
import { forkJoin, Subject } from "rxjs";
import { SummaryService } from "../@core/shared/services/school/summary/summary.service";
import { UserService } from "../@core/shared/services/user/user.service";
import { AuthService } from "../@core/services/auth/auth.service";
import { SchoolSummary } from "../@core/models/school-summary/summary";

// /**FOR MOBILE */
// declare function saveUserAndroid(user): any;

@Component({
	selector: "app-auth",
	templateUrl: "./auth.component.html",
	styleUrls: ["./auth.component.scss"]
})
export class AuthComponent implements OnInit, AfterViewInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	user: { username: string, password: string, phone: string, reset_code: string, forgotusername_phone: any } = { username: "", password: "", phone: "", reset_code: "", forgotusername_phone: "" };
	isLoading = false;

	isCorrectUsername = false;
	appAccessStatus: any;
	isMobileApp = false;
	isBackup = false;
	show_reset_code = false;
	new_user: any = {};
	activation_msg = "Check your email to activate your account";
	authenticationError_userNotEnabled = false;
	authenticationError = false;
	connectionError = false;
	connectionerror_msg = "Please check your internet connection.";
	auth_options: any = {};

	remember_credentials: any = {};
	check_email_response: any = {};
	login_options: any = {};
	check_phone_response: any = {};
	forgot_username_response: any = {};
	reset: any = {};
	error_reset = false;
	error_reset_msg = "";
	request_code_success_msg = "";
	reset_code_received = false;
	reset_password_success = false;

	registration_successful = false;
	registration_successful_msg = "";
	register_error = true;
	register_error_msg = "";
	customer_message: { name: string, phone: string, email: string, message: string } = { name: "", phone: "", email: "", message: "" };

	title = "zeraki-login";
	login = true;
	showSplash = false;
	resetSuccessful = false;
	resetCodeMessage = "";
	deviceInfo: any;
	isDesktopDevice?: boolean;
	isMobileDevice?: boolean;
	isTabletDevice?: boolean;

	isMobileFinal?: boolean;


	customOptions: OwlOptions = {
		autoWidth: true,
		loop: true,
		autoplay: true,
		autoplaySpeed: 400,
		mouseDrag: false,
		touchDrag: false,
		pullDrag: false,
		dots: false,
		nav: false,
		responsive: {
			0: {
				items: 1
			},
			400: {
				items: 2
			},
			740: {
				items: 3
			},
			940: {
				items: 4
			}
		},
	};

	slidesStore = [
		{ src: "../../../assets/img/template/Anjego-Friends-High-School.png", alt: "Anjego", title: "Anjego", id: "Anjego" },
		{ src: "../../../assets/img/template/Asumbi-Girls-High-School.png", alt: "Asumbi", title: "Asumbi", id: "Asumbi" },
		{ src: "../../../assets/img/template/Barani-Secondary-School.png", alt: "Barani", title: "Barani", id: "Barani" },
		{ src: "../../../assets/img/template/Beth-Mugo-High-School.png", alt: "Beth-Mugo-High", title: "Beth-Mugo-High", id: "Beth-Mugo-High" },
		{ src: "../../../assets/img/template/Bungoma-High-School.png", alt: "Bungoma", title: "Bungoma", id: "Bungoma" },
		{ src: "../../../assets/img/template/Buru-Buru-Girls-School.png", alt: "Buru-Buru-Girls", title: "Buru-Buru-Girls", id: "Buru-Buru-Girls" },
		{ src: "../../../assets/img/template/Butula-School.png", alt: "Butula", title: "Butula", id: "Butula" }
	];

	constructor(
    private router: Router,
    private authService: AuthService,
    private summaryService: SummaryService,
    private rolesService: RolesService,
    private dataService: DataService,
	private userService: UserService,
    private toastService: HotToastService,
    private deviceService: DeviceDetectorService,
    private siteLanguageService: SiteLanguageService,
    private translate: TranslateService
	) {
		this.deviceInfo = this.deviceService.getDeviceInfo();
		//console.warn('this.deviceInfo >> ', this.deviceInfo);
		this.isDesktopDevice = this.deviceService.isDesktop();
		//console.warn('this.isDesktopDevice >> ', this.isDesktopDevice);
		this.isMobileDevice = this.deviceService.isMobile();
		//console.warn('this.isMobileDevice >> ', this.isMobileDevice);
		this.isTabletDevice = this.deviceService.isTablet();
		//console.warn('this.isTablet >> ', this.isTabletDevice);
	}

	ngOnDestroy(): void {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}

	scrollTo(section: any) {
		section.scrollIntoView({ block: "start", behavior: "smooth" });
	}

	ngOnInit(): void {
		this.isMobileFinal = this.dataService.getIsMobile();

		this.login_options.invalidUsername = "";
		// setTimeout(() => {
		// 	this.showSplash = !this.showSplash;
		// }, 3000);
		this.controller();
		this.setRemember();
	}

	ngAfterViewInit(): void {
		// Navbar shrink function
		const navbarShrink = function () {
			const navbarCollapsible = document.body.querySelector("#mainNav");
			if (!navbarCollapsible) {
				return;
			}
			if (window.scrollY === 0) {
				navbarCollapsible.classList.remove("navbar-shrink");
			} else {
				navbarCollapsible.classList.add("navbar-shrink");
			}

		};

		// Shrink the navbar
		navbarShrink();

		// Shrink the navbar when page is scrolled
		document.addEventListener("scroll", navbarShrink);
	}

	/* Language Selection */
	readonly languages = [...languageList];

	get currentLanguage(): Language | null {
		return this.siteLanguageService.getCurrentLanguage();
	}

	switchLanguage(localeCode: LanguageCode) {
		this.siteLanguageService.changeSiteLanguage(localeCode);
	}


	controller() {
		this.isMobileApp = this.dataService.getIsMobileApp();
		this.isBackup = this.dataService.getIsBackup();
		if (this.isBackup || this.isMobileApp) {
			this.remember_credentials.remember = true;
		}
		this.initErrors();
		this.auth_options.login_error_msg = "";
		this.auth_options.login_error_data = {};
		this.initForgotUsernameRequest();
		this.initCheckEmail();
		this.init_items_register();
		this.initResetCode();
	}


	initErrors() {
		this.activation_msg = "Check your email to activate your account";
		this.authenticationError_userNotEnabled = false;
		this.authenticationError = false;
		this.connectionError = false;
		this.connectionerror_msg = "Please check your internet connection.";
		this.auth_options = {};
		this.auth_options.login_error_msg = "";
		this.auth_options.login_error_data = {};
		this.error_reset_msg = "";
	}

	initForgotUsernameRequest() {
		this.forgot_username_response = {};
	}

	initCheckEmail() {
		this.check_email_response = {};
		this.check_phone_response = {};
		this.login_options = {};
		this.login_options.show_forgot_password_view = false;
		this.login_options.password_reset = {};
		this.initForgotUsernameRequest();
	}

	initResetCode() {
		this.error_reset = false;
		this.error_reset_msg = "";
		this.request_code_success_msg = "";
		this.resetCodeMessage = "";
		this.reset_code_received = false;
		this.reset_password_success = false;
		this.reset = {};
	}

	init_items_register() {
		this.register_error = false;
		this.register_error_msg = "";
		this.registration_successful = false;
		this.registration_successful_msg = "";
	}


	showLogin() {
		this.show_reset_code = false;
		this.initResetCode();
		this.initErrors();
		this.initCheckEmail();
		this.user = { username: "", password: "", phone: "", reset_code: "", forgotusername_phone: "" };
		this.isCorrectUsername = false;
		this.resetCodeMessage = "";
	}

	reset_pass_message = "";
	newPassword = "";
	confirmPassword = "";
	directLogin() {
		this.isLoading = true;
		this.authService.loginUser(this.user.username, this.confirmPassword).subscribe({
			next: ({ body }) => {
				this.isLoading = false;
				this.reset_pass_message = "Reset successful. Redirecting...";

				// /**Save user mobile */
				// saveUserAndroid(body);

				this.initializeUser(body);
			},
			error: (err) => {
				this.isLoading = false;
				this.auth_options.login_error_data.message = err.error?.response?.message || err.error?.error?.title || err.error?.message;

				this.reset_pass_message = err.error?.response?.message || err.error?.message;

				this.authenticationError = true;

				if (err.error?.response?.message != undefined && err.error?.response?.message.length > 0) {
					this.auth_options.login_error_msg = err.error?.response?.message || err.error?.message;
				} else {
					this.auth_options.login_error_msg = "Please check your credentials and try again";
				}
			}
		});
	}

	loginUser(authForm: NgForm) {
		this.auth_options.login_error_msg = "";
		this.login_options.invalidUsername = "";
		if (authForm && !authForm.valid) {
			return;
		}

		if (!this.isCorrectUsername) {
			this.usernameSent = {};
			this.checkUsernameAnalytics();
		} else {
			this.isLoading = true;
			this.authService.loginUser(this.user.username, this.user.password).subscribe({
				next: ({ body }) => {
					const user: LocalUser = body;

					// /**Save user mobile */
					// saveUserAndroid(body);

					this.initializeUser(user);
				},
				error: err => {
					this.isLoading = false;
					console.error(err);
					this.auth_options.login_error_data.message = err.error?.response?.message || err.error?.error?.title || err.error?.message;
					this.authenticationError = true;

					if (err.error?.response?.message != undefined && err.error?.response?.message.length > 0) {
						this.auth_options.login_error_msg = err.error?.response?.message || err.error?.message;
					} else {
						this.auth_options.login_error_msg = "Please check your credentials and try again";
					}
				},
				complete: () => {
					this.isLoading = false;
				}
			});
		}
	}

	initializeUser(user: LocalUser) {
		this.authService.setLocalUser(user);
		this.rolesService.setUserRoles(user.roles);
		this.userService.setUserInfo();
		if (user.role != 100) {
			forkJoin([
				this.summaryService.getSchoolSummaryApi(),
				this.dataService.getUserInit()
			]).pipe(takeUntil(this.destroy$)).subscribe(([summary, userInit]) => {
				this.summaryService.setSchoolSummary(summary);
				this.dataService.setUserInit(userInit);
				this.handleUserRedirects(user, summary, userInit);
			});	
		} else {
			this.handleUserRedirects(user);
		}
	}

	handleUserRedirects(user: LocalUser, schoolSummary?: SchoolSummary, userInit?: any) {
		if (user.role >= 100 && user.role < 200) { // Litemore accounts
			console.log("isLitemore", user.role);

			localStorage.setItem("route", JSON.stringify("litemore"));
			this.router.navigate(["/litemore"]);
		} else if (schoolSummary?.classes == 0) {
			console.log("Account Deactivated");
			this.router.navigate(["/setup"]);
		} else if (userInit?.school_invoice_info && userInit?.school_invoice_info?.account_suspended) {
			console.log("Account Deactivated");
			this.router.navigate(["/account"]);
		} else if (userInit?.school_validity_info && !userInit?.school_validity_info?.is_valid_school) {
			console.log("Account Invalid");
			this.router.navigate(["/invalid"]);
		} else if (user.roles.isStudent) {
			console.log("isStudent");

			localStorage.setItem("route", JSON.stringify("main"));
			this.router.navigate(["/main/students/analytics", user.userid]);
		} else if (user.roles.isInMultipleSchools) {
			console.log("isInMultipleSchools");

			localStorage.setItem("route", JSON.stringify("main"));
			this.router.navigate(["/school"]);
		} else if (user.roles.isInASchool && user.role < 100 && user.roles.isSchoolApproved) { // School accounts
			console.log("isInASchool");

			localStorage.setItem("route", JSON.stringify("main"));
			this.router.navigate(["/main/dashboard/welcome"]);
		} else if (user.role == 200) { // Joint schools
			console.log("isJoint", user.role);

			localStorage.setItem("route", JSON.stringify("joint"));
			this.router.navigate(["/joint"]);
		} else if (user.roles.isInASchool && user.role < 100 && !user.roles.isSchoolApproved) {
			// School awaiting approval
			console.log("School awaiting approval");

			localStorage.setItem("route", JSON.stringify("approval"));
			this.router.navigate(["/approval"]);
		}

	}

	signUp() {
		Swal.fire({
			title: "Register",
			html: `
				<span>
				${this.translate.instant("homePage.register.info1")}
				<strong>
					<a href="tel:+254798 666 000" target="_blank" style="text-decoration: none;">
						<!-- <span class="icon-Call1 fs-22"></span> -->
						${this.translate.instant("homePage.register.number")}
					</a>
				</strong> ${this.translate.instant("homePage.register.info3")}
				<strong>
					<a target="_blank" style="text-decoration: none;">
						<!-- <span class="icon-Call1 fs-22"></span> -->
						info@zeraki.co.ke
					</a>
				</strong>
				${this.translate.instant("homePage.register.info5")}
				<strong>
					<a class="text-primary">
						<!-- <span class="icon-Call1 fs-22"></span> -->
						${this.translate.instant("homePage.register.info6")}
					</a>
				</strong> ${this.translate.instant("homePage.register.info7")}
			</span>
			`,
			confirmButtonText: "OK",
		});
		// .then((result) => {
		// 	if (result.isConfirmed) {
		// 	}
		// });
	}

	register() {
		this.initErrors();
		this.init_items_register();
		if (this.new_user.confirm_password !== this.new_user.password) {
			this.register_error = true;
			this.register_error_msg = "Your passwords don't match";
		} else {
			this.dataService.send(JSON.stringify(this.new_user), "users").subscribe({
				next: (resp: any) => {
					//console.warn("register() >> ", resp);
					if (resp.status == 200) {
						this.registration_successful = true;
						this.registration_successful_msg = resp.message;
						this.new_user = {};
					}
				},
				error: err => {
					if (err !== undefined && err.responseCode == 501) {
						this.register_error = true;
						this.register_error_msg = err.message;
					} else {
						this.register_error = true;
						this.register_error_msg = "Connection Error";
					}
				}
			});
		}
	}

	sendCustomerMessage() {
		let url = "users/customermessage?";
		if (this.customer_message.name != null && this.customer_message.phone != null && this.customer_message.message != null) {
			url += "name=" + this.customer_message.name + "&phone=" + this.customer_message.phone + "&message=" + this.customer_message.message;
			if (this.customer_message.email != null) {
				url += "&email=" + this.customer_message.email;
			}

			this.dataService.send({}, url).subscribe({
				next: (resp: any) => {
					//console.warn("sendCustomerMessage() >> ", resp);
					if (resp.message !== undefined) {
						this.activation_msg = resp.message;
						this.customer_message = { name: "", phone: "", email: "", message: "" };

						const successMsg = this.translate.instant("homePage.contact.toastMessages.success");
						// this.toastService.success("Your message has been successfully sent");
						this.toastService.success(successMsg);
					}
				},
				error: err => {
					//console.error(err);
					const errorMsg = this.translate.instant("homePage.contact.toastMessages.error");
					this.toastService.error(errorMsg);
				}
			});
		}
	}

	rem_creds = true;

	setRemember() {
		//console.warn("event >> ",);
		let rem = "true";
		if (this.rem_creds) {
			rem = "true";
		} else {
			rem = "false";
		}
		localStorage.setItem("zpass", JSON.stringify(rem));
		// let rem_pass = {remember: event};
		// localStorage.setItem('zpass', JSON.stringify(event));
		// const rem_data = JSON.parse(localStorage.getItem('zpass') || '{}');
		// //console.warn("rem_data >> ", rem_data);
	}


	isCheckingUsername = false;
	checkUsernameAnalytics() {
		this.isCheckingUsername = true;
		this.initCheckEmail();
		this.initErrors();
		// this.forgotPasswordWorkAround();
		// const data = {username: this.user.username}
		this.authService.checkUserExists(this.user.username).pipe(take(1)).subscribe({
			next: (resp: any) => {
				// console.warn("checkUsernameAnalytics >>", resp);

				/* fix for backend errors in success responses */
				if (resp && resp.body.status === 500) {
					if ((resp.body.message as string).includes("We cannot find an account with that username. Please contact the class teacher / Dean of Studies for assistance, or click <b>Forgot Username</b> below.")) {
						this.login_options.invalidUsername = resp.body.message;
						return;
					}
				}

				this.check_email_response = resp;

				// // BACKEND ADD SCHOOL URL TO RESPONSE
				// this.login_options.school_url = this.dataService.getUserImage(resp.school_url);

				// console.warn("check_email_response.reset_password >> ", this.check_email_response.body.reset_password);
				if (resp) {
					this.login_options.reset_password = this.check_email_response.body.reset_password || false;
				}

				// console.warn("forgotPasswordWorkAround() >> ", resp);
				// this.check_em_response.email = resp.email;
				// this.check_em_response.school_name = resp.school_name;

				// BACKEND ADD SCHOOL LOGO URL TO RESPONSE
				this.login_options.school_url = this.dataService.getUserImage(resp.body.school_url);

				/**INTERNAL VIEWS SCHOOL PROFILE */
				if (resp.body.school_name == "Zeraki Analytics") {
					this.login_options.school_url = "../../assets/img/avatar/avatar_school.png";
				}

				if (resp != null && resp.body.password_reset != null) {
					const labelDefault = this.translate.instant("homePage.login.forgot_password.input.labelDefault");
					const placeholderDefault = this.translate.instant("homePage.login.forgot_password.input.placeholderDefault");

					if (resp.password_reset?.label && (resp.password_reset?.label as string).includes("Enter your phone number that ends with")) {
						this.phoneLabel = this.translate.instant("homePage.login.forgot_password.input.label2", { digits: resp.password_reset.label.slice(-3) });
					} else {
						this.phoneLabel = resp.password_reset?.label || labelDefault;
					}

					this.phone_placeholder = placeholderDefault;

					// this.phoneLabel = resp.body.password_reset.label || labelDefault;
					// this.phone_placeholder = resp.body.password_reset.phone_placeholder || placeholderDefault;
				}

				if (this.check_email_response.body.status == 500) {
					this.isCorrectUsername = false;
					// if (this.check_email_response.body.show_forgot_username) {
					// 	invalid
					// }
				} else {
					this.isCorrectUsername = true;
				}

			},
			error: err => {
				console.error("err >> ", err);
				this.login_options.password_reset.title = "Reset Password";
				if (err == null || err.message == null) {
					this.connectionError = true;
				}
				if (err?.error?.passwordChange) {
					//console.warn("err.error.passwordChange true")
					this.login_options.password_reset.message = err.error?.message;
					this.login_options.reset_password = err.error.passwordChange;
					//console.warn(this.login_options.reset_password);
				}
				if (err?.error?.message == "Invalid username") {
					//console.error("Invalid username");
					this.login_options.invalidUsername = err.error.message;
				}
				this.isCorrectUsername = false;
				this.isCheckingUsername = false;
			},
			complete: () => {
				this.isCheckingUsername = false;
			}
		});
	}

	requestResetCodeAnalytics() {
		this.initErrors();
		this.error_reset = false;
		this.error_reset_msg = "";

		this.authService.resetCodeAnalytics(this.user.username, this.user.phone, this.siteLanguageService.getCurrentLanguage()?.code).subscribe({
			next: (resp: any) => {
				console.warn("requestResetCodeAnalytics >> ", resp);
				if (resp.status == 200) {
					this.request_code_success_msg = resp.body?.response?.message || "Reset code sent to your phone number";
					this.reset_code_received = true;
				} else {
					this.check_email_response.password_reset = resp;
					this.login_options.password_reset = resp;
				}

			},
			error: err => {
				//console.error("Err >> ", err);
				this.login_options.password_reset.title = "Reset Password";
				if (err.message === undefined) {
					this.error_reset_msg = "An error occured.";
				} else {
					this.error_reset_msg = err.error?.response?.message || err.error?.message;
				}
				this.error_reset = true;
			}
		});
	}

	sendResetCodeAnalytics() {
		if (this.newPassword != this.confirmPassword) {
			//console.error("Passwords do not match");
			this.resetCodeMessage = "Passwords do not match";
			return;
		}
		this.resetCodeMessage = "";
		this.reset.username = this.user.username;
		this.reset.phone = this.user.phone;
		this.reset.code = this.user.reset_code;
		this.login_options.password_reset.check_resetcode_response = {};

		this.authService.sendResetCodeAnalytics(this.user.username, this.user.reset_code, this.newPassword).pipe(take(1)).subscribe({
			next: resp => {
				// console.warn("checkResetCodeAnalytics >> ", resp);
				this.login_options.password_reset.check_resetcode_response = resp;
				this.user.password = this.reset.password2;
				this.resetSuccessful = true;
				this.initErrors();
				this.initResetCode();
				this.directLogin();
			},
			error: err => {
				//console.error('sendResetCodeAnalytics >> ', err)

				if (err == null) {
					this.connectionError = true;
				}
				if (err.error?.response?.message == "Invalid password reset code!" || err.error?.message == "Invalid password reset code!") {
					this.resetCodeMessage = err?.error?.message || err.error?.message;
				}
				if (err.error?.response?.message == "Ensure none of the fields is null" || err.error?.message == "Ensure none of the fields is null") {
					this.resetCodeMessage = err?.error?.message || err.error?.message;
				}
				if (err.error?.response?.message == "New password do not conform" || err.error?.message == "New password do not conform") {
					this.resetCodeMessage = err?.error?.message || err.error?.message;
				}
				this.toastService.error(err.error?.message);
			},
			complete: () => {
				this.resetSuccessful = true;
			}
		});
	}

	phoneLabel = "";
	phone_placeholder = "";
	check_em_response: any = {};

	forgotPasswordAnalytics() {
		this.initErrors();
		const data = { username: this.user.username };
		this.reset_code_received = false;
		this.resetSuccessful = false;
		this.login_options.reset_password = true;

		this.authService.forgotPasswordAnalytics(data, this.siteLanguageService.getCurrentLanguage()?.code).pipe(take(1)).subscribe({
			next: (resp: any) => {
				// console.warn("this.check_email_response() >> ", resp);
				this.check_email_response = resp;

				/**BACKEND ADD LABEL/TITLE */
				this.check_email_response.password_reset.hardLabel = this.translate.instant("homePage.login.forgot_password.reset_password.enterPhone");
				// console.warn(" >> ", this.check_email_response?.password_reset?.label);

				// this.check_em_response.email = resp.email;
				// this.check_em_response.school_name = resp.school_name;

				// // BACKEND ADD SCHOOL LOGO URL TO RESPONSE
				// this.login_options.school_url = this.dataService.getUserImage(resp.school_url);

				if (resp != null && resp.password_reset != null) {
					const labelDefault = this.translate.instant("homePage.login.forgot_password.input.labelDefault");
					const placeholderDefault = this.translate.instant("homePage.login.forgot_password.input.placeholderDefault");

					if (resp.password_reset?.label && (resp.password_reset?.label as string).includes("Enter your phone number that ends with")) {
						this.phoneLabel = this.translate.instant("homePage.login.forgot_password.input.label2", { digits: resp.password_reset.label.slice(-3) });
					} else {
						this.phoneLabel = resp.password_reset?.label || resp.password_reset.title || labelDefault;
					}

					this.phone_placeholder = placeholderDefault;

					// this.phoneLabel = resp.password_reset.label || labelDefault;
					// this.phone_placeholder = resp.password_reset.phone_placeholder || placeholderDefault;
				}
			},
			error: err => {
				console.error("forgotPassword() >>", err);
				// if (err == null || err.message == null) {
				//   this.connectionError = true;
				// }
			}
		});
	}

	usernameSent: any = {};
	requestingUsername = false;
	forgotUsernameRequestAnalytics() {
		this.requestingUsername = true;
		this.usernameSent = {};
		this.login_options.invalidUsername = "";
		this.initForgotUsernameRequest();

		this.authService.forgotUsernameAnalytics(this.user.forgotusername_phone, this.siteLanguageService.getCurrentLanguage()?.code).pipe(take(1)).subscribe({
			next: resp => {
				console.warn("forgotUsernameAnalytics >> ", resp);
				this.forgot_username_response = resp;
				if (this.forgot_username_response.status != 500) {
					this.initErrors();
					this.login_options.show_forgot_username_view = false;
					this.usernameSent.message = "Username sent to phone";
				}
				this.requestingUsername = false;
			},
			error: err => {
				if (err == null) {
					this.connectionError = true;
				}
				this.forgot_username_response = err.error;
				// //console.error("forgot_username_response.status >> ", this.forgot_username_response);
				this.requestingUsername = false;
			},
			complete: () => {
				if (this.forgot_username_response.status != 500) {
					this.requestingUsername = false;
				}
			}
		});
	}


	/**
   * Show/hide password.
   */
	showPassword = "password";
	onshowLoginPwd() {
		if (this.showPassword === "password") {
			this.showPassword = "text";
		} else {
			this.showPassword = "password";
		}
	}

	/**
   * Show/Hide reset passwords
   */
	showResetPassword = "password";
	onshowResetPwd() {
		if (this.showResetPassword === "password") {
			this.showResetPassword = "text";
		} else {
			this.showResetPassword = "password";
		}
	}
}
