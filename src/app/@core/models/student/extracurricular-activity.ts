export interface AddExtracurricularActivityPayload {
  academicYearId: number;
  term: number,
  description: string;
  studentId: number;
  activityId: number;
  name?: string;
  honors?: string;
}

export interface UpdateExtracurricularActivityPayload extends AddExtracurricularActivityPayload {
  id: number;
}
