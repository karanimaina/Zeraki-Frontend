export class UserInfo {
	// constructor() { }
	signature = "";
	county = "";
	userid?: number;
	osav?: number;
	url = "";
	schoolname = "";
	personalEmail: any;
	phone = "";
	countyId?: number;
	name = "";
	schoolname_short = "";
	email = "";
	personalEmailStatus: any;
	groups: any;
	tscNo?: number;
	nationalIdNumber?: number;
	biography?: string;
	gender?: any;
}

export class TeacherProfile {
	role?: number;
	gender?: string;
	phone?: string;
	imageUrl?: any;
	name?: string;
	admin?: boolean;
	groups?: Array<number>;
	userid?: number;
	tscNo?: string;
	email?: string;
	nationalIdNo?: number;
	personalEmail?: string;
}