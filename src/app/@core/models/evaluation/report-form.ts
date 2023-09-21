import {ReportFormIdentifiers} from "./report-form-identifiers";
import {StudentActivity} from "../student/student-activity";
import { Subjects } from "../classes/subject";
import {YearSummaryReport} from "./year-summary-report";
import {OlevelGrade} from "../../../main/printouts/olevels/models/olevel-grade";

export interface ReportForm{
	term: number;
	streamName: string;
	year: string;
	principalSignature: string;
	classTeacherSignature: string;
	houseTeacherSignature: string;
	evaluationMark: number;
	identifier: ReportFormIdentifiers;
	evaluationSeries: Array<{
		seriesId: number;
		seriesName: string;
	}>;
	students: Array<{
		attendance: {
			absentDays: number;
			presentDays: number;
			totalDays: number;
		};
		exams: {
			examId: number,
			examName: string,
			results: Array<{
				subjectId: number,
				factId: number,
				score: number,
				rawScore: number,
				comment: string,
			}>
		};
		studentId: number;
		studentName: string;
		studentAdmNo: string;
		gender: string;
		average: number;
		profileUrl: string;
		comment: string;
		classTeacherComment:string,
		houseTeacherComment:string,
		principalComment: string,
		evaluationAverage: number,
		subjectsAverages: Array<{
			subjectId: number;
			cbcSubjectAverage: number;
			rawSubjectAverage: number;
			totalCbcScore: number;
			totalRawScore: number;
			comment: string;
			teacherName: string;
			remarkId: number;
			generalComment: string;
			subjectComment: string;
		}>;
		evaluations: Array<{
			evaluationSeriesId: number;
			cbcScoreAverage: number;
			rawScoreAverage: number;
			results: Array<{
				subjectId: number;
				factId: number;
				score: number;
				rawScore: number;
				topicId: number;
				competencyId: number;
			}>
		}>,
		projects: Array<{
			subjectId: number;
			subjectName: string;
			projectResults: Array<{
				projectId: number;
				projectName: string;
				comment: string;
				rawMark: number;
				score: number;
			}>
		}>,
		studentActivities: Array<StudentActivity>,
		subjects: Array<Subjects>,
		yearSummary: Array<YearSummaryReport>
	}>
	subjects: Array<{
		classId: number;
		subjectId: number;
		subjectName: string;
		topics: Array<{
			topicId: number,
			topicName: string,
		}>
		competencyAreas: Array<{
			competencyAreaId: number;
			name: string;
			topicId: number
		}>
	}>;
	streams: Array<{
		streamId: number;
		streamName: string;
		intakeId: number;
	}>;
	primaryColour: string;
	secondaryColour: string;
	grades: OlevelGrade[];
}
