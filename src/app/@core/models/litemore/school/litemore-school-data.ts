import { LitemoreSchoolProfile } from "./litemore-school-profile";
import { SchoolDataItem } from "./school-data";

export interface LitemoreSchools {
  schoolMetrics: SchoolsMetrics;
}

export interface LitemoreSchoolData extends LitemoreSchools {
  schools: Array<SchoolDataItem>;
  userRole: string,
  pageInfo: PageInfo;
}

export interface LitemoreInvoiceSchool extends LitemoreSchools {
  schools: Array<LitemoreSchoolProfile>;
  totalPages: number,
	currentPage: number,
}

interface PageInfo {
  currentPage: number;
  totalPages: number;
}

interface SchoolsMetrics {
  [key:string]: number;
}
