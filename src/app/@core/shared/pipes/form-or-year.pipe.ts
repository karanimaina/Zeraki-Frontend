import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({
	name: "formOrYear"
})
export class FormOrYearPipe implements PipeTransform {
	constructor(private translate: TranslateService) {}

	transform(value: string | undefined | null): string {
		if (value) {
			if (value.includes("Form")) {
				return this.translate.instant("common.form");
			} else if (value.includes("Senior")) {
				return this.translate.instant("common.senior");
			} else if (value.includes("Year")) {
				return this.translate.instant("common.year");
			} else if (value.includes("Class")) {
				return this.translate.instant("common.class");
			} else if (value.includes("Grade")) {
				return this.translate.instant("common.grade");
			} else if (value.includes("Classe")) {
				return this.translate.instant("common.class");
			}

			return value;
		}
		return "";
	}
}
