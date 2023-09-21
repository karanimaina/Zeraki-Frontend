export interface AssessmentReport{
  intakes: Array<IntakeAssessmentSummary>
}

export interface IntakeAssessmentSummary{
  intakeId: number,
  classLevel: number,
  term: number,
  academicYearId: number,
  year: number,
  attendancePercentage: number,
  totalEvaluations: number,
  totalProjects: number
}

export interface IntakeAssessmentReport{
  classLevel: number,
  academicYearId: number,
  term: number,
  year: number,
  subjects: Array<SubjectAssessmentReport>
}

export interface SubjectAssessmentReport{
  subjectId: number,
  subjectName: string,
  totalEvaluations: number,
  totalProjects: number,
  streams: Array<StreamAssessmentReport>
}

export interface StreamAssessmentReport{
  streamId: number,
  streamName: string,
  evaluations: number,
  projects: number,
  projectId: number,
  classId: number,
  subjectTeacher: boolean,
  teacherName: string,
}
