import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({
	name: "temporaryTranslations"
})
/**TODO: Temporary solution. Get translated statuses from backend */
export class TemporaryTranslationsPipe implements PipeTransform {

	constructor(private translate: TranslateService) { }

	transform(value: string | undefined | null): string {
		if (value && typeof value == "string") {
			if (value.includes("No published exams")) {
				return this.translate.instant("dashboard.noExams");
			} else if (value.includes("Subject Teacher")) {
				return this.translate.instant("common.subjectTeacher");
			} else if (value.includes("Published by admin")) {
				return this.translate.instant("exams.myClasses.classSubjectStatus.publishedByAdmin");
			} else if (value.includes("Pending publishing by admin")) {
				return this.translate.instant("exams.myClasses.classSubjectStatus.pendingPublishingByAdmin");
			} else if (value.includes("Pending publishing by admin (No results)")) {
				return this.translate.instant("exams.myClasses.classSubjectStatus.pendingPublishingByAdminNoResults");
			} else if (value.includes("Pending publishing by class supervisor")) {
				return this.translate.instant("exams.myClasses.classSubjectStatus.pendingPublishingByClassSupervisor");
			} else if (value.includes("Pending publishing by class supervisor (No results)")) {
				return this.translate.instant("exams.myClasses.classSubjectStatus.pendingPublishingByClassSupervisorNoResults");
			} else if (value.includes("Pending publishing by class teacher")) {
				return  this.translate.instant("exams.myClasses.classSubjectStatus.pendingPublishingByClassTeacher");
			} else if (value.includes("Uploaded but not published")) {
				return  this.translate.instant("exams.myClasses.classSubjectStatus.uploadedNotPublished");
			} else if (value.includes("Upload Results")) {
				return  this.translate.instant("exams.myClasses.classSubjectStatus.uploadResults");
			} else if (value.includes("This class did not sit for the specified exam")) {
				return  this.translate.instant("exams.myClasses.classSubjectStatus.classDidNotSit");
			} else if (value.includes("Edit subject paper results")) {
				return  this.translate.instant("exams.myClasses.classSubjectStatus.editSubjPaperResults");
			} else if (value.includes("Upload / Edit subject paper results")) {
				return  this.translate.instant("exams.myClasses.classSubjectStatus.uploadEditSubjPaperResults");
			} else if (value.includes("View Results")) {
				return  this.translate.instant("exams.myClasses.classSubjectStatus.viewResults");
			} else if (value.includes("Results Not Uploaded")) {
				return this.translate.instant("exams.manageExams.status.resultsNotUploaded");
			} else if (value.includes("Published")) {
				return this.translate.instant("exams.manageExams.status.published");
			} else if (value.includes("Pending Publishing")) {
				return this.translate.instant("exams.manageExams.status.pendingPublishing");
			}

			return value;
		}

		return "";
	}

}


@Pipe({
	name: "temporaryArrayTranslations"
})
/**TODO: Temporary solution. Get translated statuses from backend */
export class TemporaryArrayTranslationsPipe implements PipeTransform {

	constructor(private translate: TranslateService) { }

	transform(arrayValue: Array<any> | undefined | null): Array<string> {
		if (arrayValue) {
			arrayValue.forEach(item => {
				// console.warn("items > ", item);
				// if (item.includes("Images named after Admission Numbers")) {
				// 	return this.translate.instant("students.up_Photo.afterAdm");
				// } else if (item.includes("Images named after UPI Numbers")) {
				// 	return this.translate.instant("students.up_Photo.afterUpi");
				// }
			});
		}

		return [""];
	}

}
