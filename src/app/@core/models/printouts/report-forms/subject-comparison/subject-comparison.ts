import {SubjectPerformance} from "./subject-performance";

export interface SubjectComparison{
	max: number,
	min: number,
	className: string,
	studentName: string,
	studentSubjectPerformance: Array<SubjectPerformance>,
	classSubjectPerformance: Array<SubjectPerformance>
}
