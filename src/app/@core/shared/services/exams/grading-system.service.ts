import { Injectable } from "@angular/core";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { sampleGradingSystem, sampleIGCSEGradingSystem, sampleTzAlevelGradingSystem, sampleTzOlevelGradingSystem, sampleTzPrimaryGradingSystem, sampleZimbabweDefaultGradingSystem, sampleZimbabwePrimaryGradingSystem } from "../../utilities/sample-grading-sytem";
import { GradingSystem } from "src/app/@core/models/exams/grading-system";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
	providedIn: "root"
})
export class GradingSystemService {
	constructor(
		private translate: TranslateService,
	) {}

	getActiveSchoolGradingSystem(schoolData?: SchoolTypeData, showTzOlevel?: boolean, showTzAlevel?: boolean): Array<GradingSystem> {
		const isGhanaSchool = (
			schoolData?.isGhanaJuniorSchool ||
			schoolData?.isGhanaPrimarySchool ||
			schoolData?.isGhanaPrimaryJuniorSchool ||
			schoolData?.isGhanaSeniorSchool
		);

		if (schoolData?.isIgcse) {
			return sampleIGCSEGradingSystem();
		}

		if (schoolData?.isTanzaniaPrimary) {
			return sampleTzPrimaryGradingSystem();
		}

		if (schoolData?.isTanzaniaSecondary && showTzOlevel) {
			return sampleTzOlevelGradingSystem();
		}

		if (schoolData?.isTanzaniaSecondary && showTzAlevel) {
			return sampleTzAlevelGradingSystem();
		}

		if (schoolData?.isZimbabwePrimarySchool) {
			return sampleZimbabwePrimaryGradingSystem();
		}

		if (schoolData?.isZimbabweSecondarySchool || schoolData?.isZimbabweIgcse) {
			return sampleZimbabweDefaultGradingSystem();
		}

		if (schoolData?.isSouthAfricaPrimarySchool || schoolData?.isSouthAfricaSecondarySchool) {
			return this.sampleSouthAfricanMentions;
		}

		if (schoolData?.isZambiaPrimarySchool || schoolData?.isZambiaSecondarySchool) {
			return this.sampleZambiaGradingSystem;
		}

		if (isGhanaSchool) {
			return this.sampleGhanaGradingSystem;
		}

		if (schoolData?.isGuineaSchool || schoolData?.isIvorianSchool) {
			return this.sampleGuineaIvorianMentions;
		}

		return sampleGradingSystem();
	}

	private get sampleGuineaIvorianMentions(): Array<GradingSystem> {
		return [
			{
				low: 0,
				high: 10,
				mention: this.translate.instant("exams.mentions.textFailed"),
				comments: this.translate.instant("exams.mentions.textExcellentComment")
			}, {
				low: 10,
				high: 12,
				mention: this.translate.instant("exams.mentions.textSufficient"),
				comments: this.translate.instant("exams.mentions.textSufficientComment")
			}, {
				low: 12,
				high: 14,
				mention: this.translate.instant("exams.mentions.textSatisfactory"),
				comments: this.translate.instant("exams.mentions.textSatisfactoryComment"),
			}, {
				low: 14,
				high: 16,
				mention: this.translate.instant("exams.mentions.textGood"),
				comments: this.translate.instant("exams.mentions.textGoodComment"),
			}, {
				low: 16,
				high: 18,
				mention: this.translate.instant("exams.mentions.textVeryGood"),
				comments: this.translate.instant("exams.mentions.textVeryGoodComment"),
			}, {
				low: 18,
				high: 20,
				mention: this.translate.instant("exams.mentions.textExcellent"),
				comments: this.translate.instant("exams.mentions.textExcellentComment"),
			}
		];
	}

	private get sampleSouthAfricanMentions(): Array<GradingSystem> {
		return [
			{
				low: 0,
				high: 29,
				mention: "1",
				comments: this.translate.instant("exams.mentions.southAfrica.textNotAchievedComment")
			},
			{
				low: 30,
				high: 39,
				mention: "2",
				comments: this.translate.instant("exams.mentions.southAfrica.textElementaryComment")
			},
			{
				low: 40,
				high: 49,
				mention: "3",
				comments: this.translate.instant("exams.mentions.southAfrica.textModerateComment"),
			},
			{
				low: 50,
				high: 59,
				mention: "4",
				comments: this.translate.instant("exams.mentions.southAfrica.textAdequateComment"),
			},
			{
				low: 60,
				high: 69,
				mention: "5",
				comments: this.translate.instant("exams.mentions.southAfrica.textSubstantialComment"),
			},
			{
				low: 70,
				high: 79,
				mention: "6",
				comments: this.translate.instant("exams.mentions.southAfrica.textMeritoriousComment"),
			},
			{
				low: 80,
				high: 100,
				mention: "7",
				comments: this.translate.instant("exams.mentions.southAfrica.textOutstandingComment"),
			}
		];
	}

	private get sampleZambiaGradingSystem(): Array<GradingSystem> {
		return [
			{
				low: 0,
				high: 39,
				grade: "U",
				points: 9,
				gpa: 1.0,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textUnsatisfactory"),
			},
			{
				low: 40,
				high: 44,
				grade: "S2",
				points: 8,
				gpa: 1.5,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textSatisfactory2"),
			},
			{
				low: 45,
				high: 49,
				grade: "S1",
				points: 7,
				gpa: 2.0,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textSatisfactory1"),
			},
			{
				low: 50,
				high: 54,
				grade: "C2",
				points: 6,
				gpa: 2.5,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textCredit2"),
			},
			{
				low: 55,
				high: 59,
				grade: "C1",
				points: 5,
				gpa: 3.0,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textCredit1"),
			},
			{
				low: 60,
				high: 64,
				grade: "M2",
				points: 4,
				gpa: 3.5,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textMerit2"),
			},
			{
				low: 65,
				high: 69,
				grade: "M1",
				points: 3,
				gpa: 4.0,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textMerit1"),
			},
			{
				low: 70,
				high: 74,
				grade: "D2",
				points: 2,
				gpa: 4.5,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textDistinction2"),
			},
			{
				low: 75,
				high: 100,
				grade: "D1",
				points: 1,
				gpa: 5.0,
				description: this.translate.instant("exams.gradingSystem.zambiaSample.descriptions.textDistinction1"),
			},
		];
	}

	private get sampleGhanaGradingSystem(): Array<GradingSystem> {
		return [
			{
				low: 0,
				high: 39,
				grade: "F9",
				gpa: 0,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.fail"),
			},
			{
				low: 40,
				high: 44,
				grade: "E8",
				gpa: 1,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.pass"),
			},
			{
				low: 45,
				high: 49,
				grade: "D7",
				gpa: 1,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.pass"),
			},
			{
				low: 50,
				high: 54,
				grade: "C6",
				gpa: 2,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.credit"),
			},
			{
				low: 55,
				high: 59,
				grade: "C5",
				gpa: 2,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.credit"),
			},
			{
				low: 60,
				high: 64,
				grade: "C4",
				gpa: 2,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.credit"),
			},
			{
				low: 65,
				high: 69,
				grade: "B3",
				gpa: 3,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.good"),
			},
			{
				low: 70,
				high: 74,
				grade: "B2",
				gpa: 3,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.veryGood"),
			},
			{
				low: 75,
				high: 100,
				grade: "A1",
				gpa: 4,
				description: this.translate.instant("exams.gradingSystem.ghanaSample.descriptions.excellent"),
			},
		];
	}
}
