import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({
	name: "schoolTypeWithParams"
})
export class SchoolTypeWithParamsPipe implements PipeTransform {

	constructor(private translate: TranslateService) { }

	transform(valueToTransform: any, schoolData: any): any {
		console.log(schoolData);

		if ((schoolData?.isKcseSchool || schoolData?.isIgcse || schoolData?.isKcpePrimarySchool)) {
			valueToTransform = this.translate.instant("teacherschoolData.add.keyInOptionForm.tscNumber");
		} else {
			valueToTransform = this.translate.instant("workSheet.headerschoolData.registrationNumber");
		}
		return valueToTransform;
	}

}
