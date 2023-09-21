export interface ReportFormBuilder{
	addDocumentTitle(title: string): void
	addHeader(schoolAddress, schoolLogo): void
	addLineSeparator(): void
	addTitle(title): void
	addStudentDetails(formOrYear, studentDetails): void
	addSubjectResults(currentExam:string, subjectResults): void
	addPerformanceOverTime(studentReport): void
	addClassTeacherRemarks(classTeacherRemarks)
	addPrincipalRemarks(schoolProfile, principalRemarks): void
	addPageBreak(): void
}
