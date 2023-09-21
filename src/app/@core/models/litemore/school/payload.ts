import { SchoolValidityStatus } from "src/app/@core/enums/litemore/school-validity-status";

export interface RetrieveInternalSchoolsPayload {
	schoolType?: string | null;
	product: string;
	schoolName?: string;
	countryId?: number;
	regionId?: number;
	countyId?: number;
	educationSystemId?: number;
	currentPage?: number;
	setupStage?: string;
	startDate?: string;
	endDate?: string;
	download?: boolean;
	subCountyId?: number;
	schoolRegionalLevel?: string;
	schoolOwnershipType?: string;
}


export interface UpdateSchoolPayload {
	schoolId: number;
	validityStatus?: SchoolValidityStatus;
	countyId?: number;
	subCountyId?: number;
	accountManagerId?: number;
	removeAccountManager?: boolean;
	contactPersonName?: string;
	contactPersonPhone?: string;
	accountOwnerId?: number;
	removeAccountOwner?: boolean;
	educationSystemId?:number;
	schoolRegionalLevel?:string;
	schoolOwnershipType?:string;
	zerakiPartnerId?: number;
	removePartner?: boolean;
}
