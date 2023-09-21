import {SubjectReport} from "./subject-report";
import {StudentActivity} from "../../../../../@core/models/student/student-activity";
import {YearSummaryReport} from "../../../../../@core/models/evaluation/year-summary-report";
import {Attendance} from "../../models/attendance-report";

export interface StudentReport {
	studentId: number,
	studentName: string,
	studentAdmNo: string,
	profileUrl: string;
	classTeacherComment: string,
	houseTeacherComment: string,
	principalComment: string,
	attendance: Attendance;
	evaluationAverage: number;
	subjects: Array<SubjectReport>,
	evaluationAverages: Array<EvaluationAverage>,
	projects: Array<Project>,
	studentActivities: Array<StudentActivity>,
	yearSummary: Array<YearSummaryReport>
}

interface EvaluationAverage {
	evaluationId: number,
	cbcScoreAverage: number,
	rawScoreAverage: number
}

export interface Project {
	subjectId: number;
	subjectName: string;
	projectResults: Array<{
		projectId: number;
		projectName: string;
		comment: string;
		rawMark: number;
		score: number;
	}>
}
