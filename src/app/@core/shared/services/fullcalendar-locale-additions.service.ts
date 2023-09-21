import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
	providedIn: "root"
})
export class FullCalendarLocaleService {

	constructor(
    private translate: TranslateService,
	) { }

	retrieveTranslations(code: string) {
		return ({
			code,
			week: {
				dow: 1, // Monday is the first day of the week.
				doy: 4, // The week that contains Jan 4th is the first week of the year.
			},
			buttonText: {
				prev: this.translate.instant("common.fullcalendar.buttonText.prev"),
				next: this.translate.instant("common.fullcalendar.buttonText.next"),
				today: this.translate.instant("common.fullcalendar.buttonText.today"),
				year: this.translate.instant("common.fullcalendar.buttonText.year"),
				month: this.translate.instant("common.fullcalendar.buttonText.month"),
				week: this.translate.instant("common.fullcalendar.buttonText.week"),
				day: this.translate.instant("common.fullcalendar.buttonText.day"),
				list: this.translate.instant("common.fullcalendar.buttonText.list"),
			},
			weekText: this.translate.instant("common.fullcalendar.weekText"),
			allDayText: this.translate.instant("common.fullcalendar.allDayText"),
			moreLinkText: this.translate.instant("common.fullcalendar.moreLinkText"),
			noEventsText: this.translate.instant("common.fullcalendar.noEventsText"),
		});
	}
}
