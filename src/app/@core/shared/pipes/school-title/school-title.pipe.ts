import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({
	name: "schoolTitle"
})
export class SchoolTitlePipe implements PipeTransform {
	constructor(private translate: TranslateService) { }
  
	transform(value: string | undefined): string {
		if (value) {
			if (value.includes("Form")) {
				return this.translate.instant("common.secondary");
			} else if (value.includes("Class")) {
				return this.translate.instant("common.primary");
			}
	
			return value;	
		}
		return "";
	}

}

