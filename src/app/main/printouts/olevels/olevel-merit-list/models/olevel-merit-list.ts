import {OlevelExamReportBase} from "../../models/olevel-exam-report-base";

export interface OlevelMeritList extends OlevelExamReportBase {
	studentsResults: Array<{ [key: string]: string | number | SubjectResult }>;
	subjectColumnLabels: Array<string>;
	assessmentColumnLabels: Array<string>;
}

interface SubjectResult {
	[key: string]: number | null;
}
