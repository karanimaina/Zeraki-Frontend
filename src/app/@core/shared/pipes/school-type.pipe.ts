import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({
	name: "schoolType"
})
export class SchoolTypePipe implements PipeTransform {

	constructor(private translate: TranslateService) { }

	transform(s: any): any {
		let res = "";
		if (s?.isKcseSchool || s?.isIgcse || s?.isKcpePrimarySchool) {
			res = this.translate.instant("teachers.add.keyInOptionForm.tscNumber");
		} else {
			res = this.translate.instant("workSheet.headers.registrationNumber");
		}
		return res;
	}

}
