export interface SubjectPapers {
	subjectId: number;
	subjectName: string;
	hasDefaultPaperPresets: boolean;
	papers: Paper[];
}

export interface Paper {
	paperId: number | null;
	paperName: string;
	ratio: number | null;
	status: PaperStatus;
	maxMarks: number;
}

export enum PaperStatus {
	UNSET = -1,
	DISABLED = 0,
	ACTIVE = 1,
}
