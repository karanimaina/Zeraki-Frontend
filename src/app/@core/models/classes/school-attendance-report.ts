export interface SchoolAttendanceReport{
  schoolId: number,
  intakes: Array<{
    form: number,
    intakeId: number,
    intakeAttendancePercentage: number,
  }>,
  termOptions: {
    currentYear: number,
    currentTerm: number,
    termYears: Array<{
      year: number,
      term: number,
      label: string,
    }>
  }
}
