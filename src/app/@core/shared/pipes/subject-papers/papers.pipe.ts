import {Pipe, PipeTransform} from "@angular/core";
import {TranslateService} from "@ngx-translate/core";

@Pipe({
	name: "paperName"
})
export class PapersPipe implements PipeTransform {
	constructor(private translate: TranslateService) { }

	transform(value: any): any {
		if (value) {
			return value.map(val => {
				if (val.papername.includes("1")) {
					val.papername = this.translate.instant("common.paper1");
					return val;
				} else if (val.papername.includes("2")) {
					val.papername = this.translate.instant("common.paper2");
					return val;
				} else if (val.papername.includes("3")) {
					val.papername = this.translate.instant("common.paper3");
					return val;
				}
			});
		}
		return "";
	}

}
