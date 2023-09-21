import { Subjects } from "./classes/subject";

export interface SchoolTypeData {
	compulsory_subject_int_codes: number[];
	current_forms_list: Array<SchoolIntake>;
	first_possible_form: number;
	formoryear: string;
	graduated_forms_list: Array<GraduatedIntake>;
	isIgcse: boolean;
	isKcpePrimarySchool: boolean;
	isKcseSchool: boolean;
	isOLevelSchool: boolean;
	isGuineaSchool: boolean;
	isGuineaPrimarySchool: boolean;
	isGuineaSecondarySchool: boolean;
	isTanzaniaPrimary: boolean;
	isTanzaniaSecondary: boolean;
	isIvorianSecondarySchool: boolean;
	isIvorianSchool: boolean;
	isIvorianPrimarySchool: boolean;
	isZimbabwePrimarySchool: boolean;
	isZimbabweSecondarySchool: boolean;
	isZimbabweIgcse: boolean;
	isSouthAfricaPrimarySchool: boolean;
	isSouthAfricaSecondarySchool: boolean;
	isZambiaPrimarySchool: boolean;
	isZambiaSecondarySchool: boolean;
	isGhanaPrimarySchool: boolean;
	isGhanaPrimaryJuniorSchool: boolean;
	isGhanaJuniorSchool: boolean;
	isGhanaSeniorSchool: boolean;
	last_possible_form: number;
	minSubjects: number;
	possible_forms_list: Array<number>;
	logo: string;
	includeCompulsorySubjects: boolean;
	hasSuperAdmins: boolean;
	majorLabel: string;
	mentionLabel: string;
}

export interface SchoolIntake {
	classlevel: number | string;
	intakeid: number;
	streams: Array<SchoolStream>;
}

export interface GraduatedIntake {
	graduationYear: string;
	intakeid: number;
	streams: Array<BaseStream>;
}

export interface SchoolStream extends BaseStream {
	subjects: Array<Subjects>;
}

export interface BaseStream {
	streamid: number;
	name: string;
}
