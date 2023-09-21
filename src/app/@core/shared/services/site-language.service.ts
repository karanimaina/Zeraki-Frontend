import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { environment } from "src/environments/environment";
import { Language, LanguageCode, languageList } from "../utilities/site-language";
import { BehaviorSubject, Observable } from "rxjs";


@Injectable({
	providedIn: "root"
})
export class SiteLanguageService {
	private localStorageLang = localStorage.getItem("lang");
	private currentLanguage: Language | null = this.localStorageLang ? <Language>JSON.parse(this.localStorageLang) : null;
	private _currentLanguage$: BehaviorSubject<string> = new BehaviorSubject<string>(this.currentLanguage?.code || "en");

	constructor(
		private translateService: TranslateService,
		private http: HttpClient
	) {
		this.translateService.onLangChange.subscribe((event) => {
			this._currentLanguage$.next(event.lang);
		});
	}

	changeSiteLanguage(localeCode: LanguageCode): void {
		const foundLanguage = languageList.find((language) => language.code === localeCode);
		if (!foundLanguage) return;

		this.currentLanguage = foundLanguage;

		this.translateService.use(localeCode)
			.subscribe(() => {
				localStorage.setItem("lang", JSON.stringify(this.currentLanguage));
			});

	}

	getCurrentLanguage(): Language | null {
		return this.currentLanguage;
	}

	get currentLanguage$(): Observable<string> {
		return this._currentLanguage$.asObservable();
	}

	changeUserLanguage(userId: number, languageCode?: LanguageCode) {
		return this.http.post(`${environment.apiurl}/users/language?language=${languageCode}&userId=${userId}`, null);
	}

	getLanguages() {
		return this.http.get(`${environment.apiurl}/localisation`);
	}

}
