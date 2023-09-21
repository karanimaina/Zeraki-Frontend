import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
	providedIn: "root"
})
export class UtilService {

	constructor(
    private translate: TranslateService,
	) { }

	/**
   * translates text in the 'formoryear' field that comes from the backend
   * @param rawValue the raw value from the 'formoryear' field to translate
   * @returns the translated 'formoryear' value
   */
	translateFormOrYear(rawValue: string): string {
		if (rawValue) {
			if (rawValue.includes("Form")) {
				return this.translate.instant("common.form");
			} else if (rawValue.includes("Senior")) {
				return this.translate.instant("common.senior");
			} else if (rawValue.includes("Year")) {
				return this.translate.instant("common.year");
			} else if (rawValue.includes("Class")) {
				return this.translate.instant("common.class");
			}
		}

		return rawValue;
	}

}
