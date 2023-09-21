import { Injectable } from "@angular/core";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "../../data/data.service";

@Injectable({
	providedIn: "root"
})
export class SchoolTypeCheckerService {
	private schoolData!: SchoolTypeData;

	constructor(private dataService: DataService) {
		this.dataService.schoolData.subscribe((schoolData) => {
			this.schoolData = schoolData;
		});
	}

	get isKcpePrimarySchool() {
		return this.schoolData?.isKcpePrimarySchool;
	}

	get isKcseSchool() {
		return this.schoolData?.isKcseSchool;
	}

	get isKenyanSchool() {
		return this.schoolData?.isKcseSchool || this.schoolData?.isKcpePrimarySchool || this.schoolData?.isIgcse;
	}

	get isOlevelSchool() {
		return this.schoolData?.isOLevelSchool;
	}

	get isGuineaSchool() {
		return this.schoolData?.isGuineaSchool;
	}

	get isIgseSchool() {
		return this.schoolData?.isIgcse;
	}

	get isTanzaniaPrimary() {
		return this.schoolData?.isTanzaniaPrimary;
	}

	get isTanzaniaSecondary() {
		return this.schoolData?.isTanzaniaSecondary;
	}

	get isTanzaniaSchool() {
		return this.schoolData?.isTanzaniaPrimary || this.schoolData?.isTanzaniaSecondary;
	}

	get isZimbabweSchool() {
		return this.schoolData?.isZimbabwePrimarySchool || this.schoolData?.isZimbabweSecondarySchool || this.schoolData.isZimbabweIgcse;
	}

	get isZambiaSchool() {
		return this.schoolData?.isZambiaPrimarySchool || this.schoolData?.isZambiaSecondarySchool;
	}
}
