import {GenericSkillOption} from "./generic-skill-option";

export interface EvaluationReport{
	classId: number;
	subjectName: string;
	reportName: string;
	classAverage: {
		evaluationAverage: number;
		comment: string;
		evaluations: Array<{
			evaluationId: number;
			evaluationName: string;
			score: number;
		}>
	}
	students: Array<{
		studentId: number;
		studentName: string;
		studentAdmNo: string;
		studentAverage: number;
		comment: string;
		remarkId: number;
		subjectComment: string;
		generalComment: string;
		evaluations: Array<{
			evaluationId: number;
			evaluationName: string;
			score: number;
		}>
	}>,
	genericSkillsOptions: GenericSkillOption[]
}
