import { TranslateService } from "@ngx-translate/core";
import { AppInjector } from "src/app/app.module";
import { SchoolDataItem } from "../school/school-data";
import { SchoolDataItemAction } from "../school/school-data-action";

export class DefaultSchool implements SchoolDataItem {
	isEditable?: boolean = false;

	constructor(
		public schoolId: number,
		public name: string,
		public registrationCode: string,
		public county: string,
		public subCountyName: string,
		public subscriptionEndDate: string,
		public registrationDate: string,
		public senderId: string,
		public smsCreditsBalance: number,
		public zerakiPartner: string,
		public accountManager: string,
		public accountOwner: string,
		public index: number,
		public educationSystem: string,
		public schoolRegionalLevel: string,
		public schoolOwnershipType: string,
		public contactPersonName: string,
		public contactPersonPhone: string,
		public teachers: number,
		public students: number,
		public femaleTeacherCount: number,
		public maleTeacherCount: number,
		public boysStudentCount: number,
		public girlsStudentCount: number
	) { }

	tableHeaders(): { key: string; text: string }[] {
		const translate = AppInjector.get(TranslateService);
		return [
			{
				key: "registrationDate",
				text: translate.instant("litemore.registrationDate")
			},
			{
				key: "county",
				text: translate.instant("common.county")
			},
			{
				key: "subCountyName",
				text: translate.instant("common.subCounty")
			},
			{
				key: "educationSystem",
				text: translate.instant("litemore.educationSystem")
			},
			{
				key: "schoolOwnershipType",
				text: translate.instant("litemore.createSchool.schoolOwnership")
			},
			{
				key: "schoolRegionalLevel",
				text: translate.instant("litemore.createSchool.schoolRegionalLevel")
			},
			{
				key: "senderId",
				text: translate.instant("litemore.senderID")
			},
			{
				key: "smsCreditsBalance",
				text: translate.instant("litemore.smsBalance")
			},
			{
				key: "subscriptionEndDate",
				text: translate.instant("litemore.subEndDate")
			},
			{
				key: "zerakiPartner",
				text: translate.instant("litemore.zerakiPartner")
			},
			{
				key: "accountManager",
				text: translate.instant("litemore.accManager")
			},
			{
				key: "accountOwner",
				text: translate.instant("litemore.accOwner")
			},
			{
				key: "contactPersonName",
				text: translate.instant("litemore.schools.contactPersonName")
			},
			{
				key: "contactPersonPhone",
				text: translate.instant("litemore.schools.contactPersonPhone")
			},
			{
				key: "femaleTeacherCount",
				text: translate.instant("litemore.schools.femaleTeacherCount")
			},
			{
				key: "maleTeacherCount",
				text: translate.instant("litemore.schools.maleTeacherCount")
			},{
				key: "teachers",
				text: translate.instant("litemore.schools.teachers")
			},{
				key: "boysStudentCount",
				text: translate.instant("litemore.schools.boysStudentCount")
			},{
				key: "girlsStudentCount",
				text: translate.instant("litemore.schools.girlsStudentCount")
			},{
				key: "students",
				text: translate.instant("litemore.schools.students")
			}
		];
	}

	actions(): SchoolDataItemAction {
		return {
			enabled: false,
			items: []
		};
	}
}
