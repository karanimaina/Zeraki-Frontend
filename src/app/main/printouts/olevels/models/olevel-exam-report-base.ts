export interface OlevelExamReportBase {
	examName: string;
	academicYear: number;
	term: number;
	classLevel: number;
	stream: string;
	columnLabels: Array<string>;
	generatedSpreadsheet?: string;
}
