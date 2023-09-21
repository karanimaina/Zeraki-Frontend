import {PerformancePerSubject} from "./performance-per-subject";
import {AdditionalExamsPerformance} from "./additional-exams-performance";

export interface SubjectsReport{
	showSubjectRank: boolean,
	showTargetGrades: boolean,
	suffix: string,
	valueType: string,
	subjectsPerformance: Array<PerformancePerSubject>,
	additionalExams: Array<AdditionalExamsPerformance>
}
