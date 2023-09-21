import {AggregateStatistics} from "./aggregate-statistics";
import {SubjectComparison} from "./subject-comparison/subject-comparison";
import {SubjectsReport} from "./subjects/subjects-report";
import {TimeSeries} from "./time-series/time-series";

export interface StudentReport{
	userId: number,
	studentName: string,
	upi: string,
	profilePicUrl: string,
	admNo: string,
	vap: number,
	aggregateStatistics: { [key: string] : AggregateStatistics },
	classTeacher: { name: string , signature: string},
	classTeacherRemarks: string,
	classTeacherRemarksCustom: string,
	currentExam: string,
	examClassName: string,
	examId: string,
	examName: string,
	exams: [],
	examType: number,
	kcpe: number,
	principalRemarks: string,
	seriesid: number,
	studentVsClassSubjectComparison: SubjectComparison,
	subjectsReport: SubjectsReport,
	timeSeries: TimeSeries,
	majorName: string,
	majorTextCode: string,
	credentialMessage: string;
}
