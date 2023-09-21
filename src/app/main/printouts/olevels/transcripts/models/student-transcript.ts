import {YearSummaryReport} from "../../../../../@core/models/evaluation/year-summary-report";
import {Attendance} from "../../models/attendance-report";

export interface StudentTranscript {
	yearSummary: YearSummaryReport[];
	studentDetails: TranscriptStudentDetails;
	classTeacherComments: string;
	principalComments: string;
	houseTeacherComments: string;
}

export interface TranscriptStudentDetails {
	studentId: number;
	studentName: string;
	studentAdmNo: string;
	profileUrl: string;
	attendance: Attendance;
}
