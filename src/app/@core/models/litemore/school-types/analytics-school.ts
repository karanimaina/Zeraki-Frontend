import { SchoolValidityStatus } from "src/app/@core/enums/litemore/school-validity-status";
import { SchoolDataItemAction } from "../school/school-data-action";
import { DefaultSchool } from "./default-school";

export class AnalyticsSchool extends DefaultSchool {
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
		public teachers:number,
		public students:number,
		public femaleTeacherCount:number,
		public maleTeacherCount:number,
		public boysStudentCount:number,
		public girlsStudentCount:number
	) {
		super(
			schoolId,
			name,
			registrationCode,
			county,
			subCountyName,
			subscriptionEndDate,
			registrationDate,
			senderId,
			smsCreditsBalance,
			zerakiPartner,
			accountManager,
			accountOwner,
			index,
			educationSystem,
			schoolRegionalLevel,
			schoolOwnershipType,
			contactPersonName,
			contactPersonPhone,
			teachers,
			students,
			femaleTeacherCount,
			maleTeacherCount,
			boysStudentCount,
			girlsStudentCount
		);
		super.isEditable = true;
	}

	actions(): SchoolDataItemAction {
		return {
			enabled: true,
			items: [
				{
					text: "Invalidate",
					schoolType: "Invalid",
					validityStatus: SchoolValidityStatus.Invalidate,
					roles: []
				},
				{
					text: "Make Joint School",
					schoolType: "Joint",
					validityStatus: SchoolValidityStatus.MakeJointSchool,
					roles: []
				},
				{
					text: "Make Demo School",
					schoolType: "Demo",
					validityStatus: SchoolValidityStatus.MakeDemoSchool,
					roles: []
				},
				{
					text: "Make Finance School",
					validityStatus: SchoolValidityStatus.MakeFinanceSchool,
					schoolType: "Finance",
					roles: []
				}
			]
		};
	}
}
