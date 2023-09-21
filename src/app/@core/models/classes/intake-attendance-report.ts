export interface IntakeAttendanceReport{
  form: number,
  intakeId: number,
  year: number,
  term: number,
  intakeAttendancePercentage: number,
  streams: Array<{
    streamId: number,
    streamName: string,
    streamAttendancePercentage: number,
    students: Array<{
      userId: number,
      admNo: number,
      studentName: string,
      presentDays: number,
      absentDays: number,
      presentPercentage: number,
      streamId?: number,
      streamName?: string,
    }>
  }>
}
