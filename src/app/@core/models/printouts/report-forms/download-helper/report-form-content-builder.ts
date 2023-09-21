export interface ReportFormContentBuilder{
  addHeader(): void
  addLineSeparator(): void
  addTitle(): void
  addStudentDetails(): void
  addSubjectResults(): void
  addPerformanceOverTime(): void
  addClassTeacherRemarks()
  addPrincipalRemarks(): void
  addPageBreak(): void
}
