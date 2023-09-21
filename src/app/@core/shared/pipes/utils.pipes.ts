import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer, SafeHtml, SafeResourceUrl, SafeScript, SafeStyle, SafeUrl } from "@angular/platform-browser";
import { TranslateService } from "@ngx-translate/core";
import * as moment from "moment";

@Pipe({ name: "stringToDate" })
export class stringToDatePipe implements PipeTransform {
	transform(date: string): any {
		if (!date) return date;
		return moment(date, "DD-MM-YYYY");
	}
}

// @Pipe({ name: "normalCase" })
// export class NormalCasePipe implements PipeTransform {
// 	transform(string: string): any {
// 		if (!string) return string;
// 		return string.replace(/([A-Z])/g, " $1").replace(/^./, function (str) { return str.toUpperCase(); });
// 	}
// }

@Pipe({ name: "safeHtml" })
export class SafeText implements PipeTransform {
	constructor(private sanitizer: DomSanitizer) { }

	transform(value: string, type: string): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
		switch (type) {
		case "html":
			return this.sanitizer.bypassSecurityTrustHtml(value);
		case "style":
			return this.sanitizer.bypassSecurityTrustStyle(value);
		case "script":
			return this.sanitizer.bypassSecurityTrustScript(value);
		case "url":
			return this.sanitizer.bypassSecurityTrustUrl(value);
		case "resourceUrl":
			return this.sanitizer.bypassSecurityTrustResourceUrl(value);
		default:
			return this.sanitizer.bypassSecurityTrustHtml(value);
		}
	}
}

@Pipe({
	name: "safe"
})
export class SafePipe implements PipeTransform {

	constructor(private sanitizer: DomSanitizer) { }
	transform(url) {
		return this.sanitizer.bypassSecurityTrustResourceUrl(url);
	}
}

@Pipe({
	name: "translateSubjectValue"
})
export class translateSubjectValuePipe implements PipeTransform {

	constructor(private translate: TranslateService) { }
	transform(value: string) {
		switch (value) {
		case "Marks":
			return this.translate.instant("common.marks");
	
		default:
			return value;
		}
	}
}