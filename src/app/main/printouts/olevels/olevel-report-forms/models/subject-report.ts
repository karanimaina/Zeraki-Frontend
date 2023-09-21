export interface SubjectReport {
	subjectId: number,
	subjectName: string,
	evaluations: Array<Evaluation>,
	competencyAreas: Array<CompetencyArea>,
	topics: Array<Topic>,
	exams: SubjectExam,
	teacherName: string,
	cbcSubjectAverage: number,
	rawSubjectAverage: number,
	comment: string;
	remarkId: number;
	generalComment: string;
	subjectComment: string;
	totalCompetencyAreas: number;
}

interface Evaluation {
	evaluationId: number,
	score: number,
	competencyAreas: Array<{
		competencyAreaId: number,
		score: number,
	}>
}

interface CompetencyArea {
	competencyAreaId: number,
	name: string,
	average: string,
	evaluations: Array<{
		competencyId: number,
		score: number,
		rawScore?: number
	}>
}

interface Topic {
	topicId: number,
	name: string,
	average: string,
	evaluations: Array<{
		topicId: number,
		competencyId: number,
		score: number
	}>,
	competencyAreas: Array<CompetencyArea>,
}

interface SubjectExam {
	examId: number,
	score: number,
	comment: string,
}
