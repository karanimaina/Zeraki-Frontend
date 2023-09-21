import { AssessmentStatus } from "../../enums/assessments/assessment-status";
import { AcademicYearShort } from "../common/academic-year";

export interface AssessmentResponse {
	ayid: number;
	year: number;
	className: string;
	years: Array<number>;
	academic_years: Array<AcademicYearShort>;
	terms: Array<AssessmentTermResponse>;
}

export interface AssessmentTermResponse {
	name: string;
	term: number;
	exams: Array<AssessmentExamResponse>;
}

export interface AssessmentExamResponse {
	interrogationId: number;
	term: number;
	name: string;
	type: string;
	published: boolean;
	classes: Array<any>;
}

export interface AssessmentCLassResponse {
	action_label: string;
	classid: number;
	current_form: string;
	delete: boolean;
	form: string;
	name: string;
	status: AssessmentStatus;
	status_label: string;
	unpublish: boolean;
	updatedBy: string;
	updatedOn: string;
}
