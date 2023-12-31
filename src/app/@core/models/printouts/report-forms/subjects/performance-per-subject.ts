export interface PerformancePerSubject {
	subjectId: number,
	subjectName: string,
	change: number,
	comment: string,
	customComment: string,
	grade: string,
	subjectRank: number,
	subjectRankOutOf: number,
	subjectTeacher: string,
	value: number,
	additionalResults: { [ key: number ] : number },
	mention: string,
	level: string,
	gradeAverage: number,
	weight: number,
	gpa: number,
}
