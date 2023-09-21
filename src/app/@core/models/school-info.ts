import { SchoolGenderTypes } from "../enums/gender/school-gender-types";

type Boarding = "Mixed" | "Boarding" | "Day";

export interface SchoolInfo {
  address: string;
  boardingStatus: Boarding;
  canAccessShop: boolean;
  canViewWAFab: boolean;
  currentuserisprincipal: boolean
  dos: {
    signature: string,
    name: string,
    userid: number
  }
  email: string;
  genderType: SchoolGenderTypes;
  hasStudentBehaviour: boolean;
  hasTimetable: boolean;
  hasfinance: boolean;
  logo: string;
  name: string;
  phone: string;
  principal: {
    signature: string,
    name: string,
    title: string,
    userid: number,
  }
  deputyPrincipal: {
    signature: string,
    name: string,
    title: string,
    userid: number,
  }
  setupStage: number;
  shortName: string;
  show_setup: boolean;
  subscription: any;
  tscInAnalysisReport: boolean;
  type: string;
}

export class SchoolProfile {
	address = "";
	canAccessShop?: boolean;
	canViewWAFab?: boolean;
	currentuserisprincipal?: boolean;
	dos: {
    signature: string,
    name: string,
    userid: number
  } = {
			signature: "",
			name: "",
			userid: 0
		};
	email = "";
	genderType?: number;
	hasStudentBehaviour?: boolean;
	hasTimetable?: boolean;
	hasfinance?: boolean;
	logo?: string;
	name = "";
	phone = "";
	principal: {
    signature: string,
    name: string,
    title: string,
    userid: number,
  } = {
			signature: "",
			name: "",
			title: "",
			userid: 0,
		};
	setupStage?: number;
	shortName?: string;
	show_setup?: boolean;
	subscription: any;
	tscInAnalysisReport?: boolean;
	type?: string;
}
