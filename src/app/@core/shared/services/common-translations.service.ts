import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
	providedIn: "root"
})
export class CommonTranslationsService {

	constructor(
    private translate: TranslateService,
	) { }

	get subjects(): { name: string; value: string }[] {
		const eng = this.translate.instant("common.subjects.eng");
		const kisw = this.translate.instant("common.subjects.kisw");
		const math = this.translate.instant("common.subjects.math");
		const bio = this.translate.instant("common.subjects.bio");
		const phyc = this.translate.instant("common.subjects.phyc");
		const chem = this.translate.instant("common.subjects.chem");
		const hist = this.translate.instant("common.subjects.hist");
		const geog = this.translate.instant("common.subjects.geog");
		const cre = this.translate.instant("common.subjects.cre");
		const comp = this.translate.instant("common.subjects.comp");

		return ([
			{ name: "English", value: eng },
			{ name: "Kiswahili", value: kisw },
			{ name: "Mathematics", value: math },
			{ name: "Biology", value: bio },
			{ name: "Physics", value: phyc },
			{ name: "Chemistry", value: chem },
			{ name: "History and Government", value: hist },
			{ name: "Geography", value: geog },
			{ name: "C.R.E.", value: cre },
			{ name: "Computer Studies", value: comp },
		]);
	}

}
