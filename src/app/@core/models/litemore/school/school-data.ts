import { SchoolDataItemAction } from "./school-data-action";

export interface SchoolDataItem {
	schoolId: number;
	index?: number;
	educationSystemId?: number | null;
	countyId?: number;
	subCountyId?: number;
	subCountyName?: string;
	genderType?: string | null;
	registrationCode: string;
	name: string;
	senderId?: string | null;
	subscriptionEndDate?: string | null;
	subscriptionDeadlineExtension?: string | null;
	zerakiPartner?: string | null;
	accountManager?: string | null;
	accountOwner?: string | null;
	county?: string;
	registrationDate?: string | null;
	boardingStatus?: string | null;
	contactPersonName?: string | null;
	contactPersonPhone?: string | null;
	email?: string | null;
	phone?: string | null;
	educationSystem?: string | null;
	smsCreditsBalance?: number | null;
	admins?: number | null;
	teachers?: number | null;
	students?: number | null;
	femaleTeacherCount?:number | null;
	maleTeacherCount?:number | null;
	boysStudentCount?:number|null;
	girlsStudentCount?:number|null;
	isEditable?: boolean;
	schoolRegionalLevel?: string | null;
	schoolOwnershipType?: string | null;
	[key: string]: any;

	tableHeaders(): Array<{ key: string; text: string }>;

	actions(): SchoolDataItemAction;
}
