import { Component, OnInit } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { AuthService } from "./@core/services/auth/auth.service";
import { SiteLanguageService } from "./@core/shared/services/site-language.service";
import { Language } from "./@core/shared/utilities/site-language";

export let browserRefresh = false;

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {

	title = "zeraki-analytics";
	subscription: Subscription;

	constructor(
		private authService: AuthService,
		private router: Router,
		private siteLanguageService: SiteLanguageService,
	) {
		this.subscription = router.events.subscribe((event) => {
			if (event instanceof NavigationStart) {
				browserRefresh = !router.navigated;
			}
		});
		
		if (this.currentLanguage) {
			this.siteLanguageService.changeSiteLanguage(this.currentLanguage.code);
		} else {
			// Using window navigator to find default language
			if (window.navigator.language) {
				if (window.navigator.language.includes("en")) {
					this.siteLanguageService.changeSiteLanguage("en"); // Use default English
				} else if (window.navigator.language.includes("fr")) {
					this.siteLanguageService.changeSiteLanguage("fr"); // Use default French
				} else if (window.navigator.language.includes("am")) {
					this.siteLanguageService.changeSiteLanguage("am"); // Use default Kinyarwanda
				} else if (window.navigator.language.includes("sw")) {
					this.siteLanguageService.changeSiteLanguage("sw"); // Use default Swahili
				} else {
					this.siteLanguageService.changeSiteLanguage("en"); // default language
				}
			} else {
				this.siteLanguageService.changeSiteLanguage("en"); // default language
			}

		}
	}


	public get currentLanguage(): Language | null {
		return this.siteLanguageService.getCurrentLanguage();
	}

	ngOnInit(): void {
		this.authService.autoLoginAnalytics();
	}

}
