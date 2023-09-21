import { AppInjector } from "src/app/app.module";
import { SchoolTypeData } from "../../models/school-type-data";
import { TranslateService } from "@ngx-translate/core";

export class BasicUtils {

	static compare(a: number | string, b: number | string, isAsc = false) {
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	static displayValue(headerName) {
		let name = headerName;
		/*
			- Transforms camelCase to space separated i.e. camel Case
			- Replaces underscores in string i.e. first_name = first name
		 */
		name = name.replace(/([^[\p{L}\d]+|(?:[\p{Ll}\d])(?=\p{Lu})|(?:\p{Lu})(?=\p{Lu}[\p{Ll}\d])|(?:[\p{L}\d])(?=\p{Lu}[\p{Ll}\d]))/gu, " ");
		/*
			- Capitalizes first letter i.e. first name = First Name
		 */
		name = name.replace(/(^\w|\s\w)/g, m => m.toUpperCase());

		return name;
	}

	static cleanedMarksOrGrade(marks): number | string {
		/* Replace spase with blank string */
		marks = marks.replace(/\s/g, "");
		/* Replace any character in digit with blank string to get grade */
		const grade = marks.replace(/[\d.]/gi, "").trim().toUpperCase();
		/* Replace any character NOT in digit with blank string to get marks */
		marks = marks.replace(/[^\d.]/gi, "").trim();

		const marksLength = marks.length;
		if (marksLength > 0) {
			/* Replace any trailing "." character, either at the start or end */
			if (marks.charAt(0) === "." || marks.charAt(marksLength - 1) === ".") {
				marks = marks.replace(/[^\d]/gi, "").trim();
			}
		}

		if (grade && (grade == "X" || grade == "Y")) {
			return grade;
		} else {
			return marks;
		}
	}

	/**
	 * converts a string to title case
	 * @param str string to convert to title case
	 * @returns the string converted to title case
	 */
	static toTitleCase(str: string) {
		return str.replace(
			/\w\S*/g,
			function (txt) {
				return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
			}
		);
	}

	/**
	 * SHortens a string to the given length
	 * @param inputString String to be shortened
	 * @param maxLength Maximum length required
	 * @param separator Next line determiner
	 * @returns
	 */
	static shorten(inputString: string, maxLength: number, separator = " ") {
		if (inputString.length <= maxLength) return inputString;
		return inputString.substring(0, inputString.lastIndexOf(separator, maxLength));
	}

	static upiTranslation(schoolTypeData?: SchoolTypeData): string {
		const translate = AppInjector.get(TranslateService);
		const upiTranslation = schoolTypeData?.isOLevelSchool ?
			translate.instant("common.regNumberShort")
			: (schoolTypeData?.isTanzaniaPrimary || schoolTypeData?.isTanzaniaSecondary) ? translate.instant("common.premNumberShort")
				: translate.instant("common.upi");

		return upiTranslation;
	}

}
