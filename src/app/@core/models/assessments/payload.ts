export interface AssessmentAdditionPayload {
	name: string;
	term: number;
	year: number;
	classId: number;
	type: string;
}

export interface AssessmentUpdatePayload {
	interrogationId: number;
	name: string;
}
