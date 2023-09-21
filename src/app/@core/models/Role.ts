import { LitemoreUserRole } from "../enums/litemore-user-role";

export interface Role {
	isMessenger: boolean;
	adminHomePage: boolean
	canEditSubjectPaperPresets: boolean
	can_add_extracurricular: boolean
	can_add_target_grades: boolean
	can_approve_infractions: boolean
	isSuperAdmin: boolean
	isClassSupervisor: boolean
	isClassTeacher: boolean
	isInASchool: boolean
	isInMultipleSchools: boolean
	isPrincipal: boolean
	isDeputyPrincipal: boolean
	isSchoolAdmin: boolean
	isSchoolApproved: boolean
	isSchoolCreator: boolean
	isSchoolOfficial: boolean
	isSchoolWorker: boolean
	isStudent: boolean
	isSubjectTeacher: boolean
	isTeacher: boolean
	isexternalpartner: boolean
	iszerakipartner: boolean
	subject_papers_accessible: boolean
	litemoreRoles: LitemoreUserRole[]
	isDos: boolean;
}
