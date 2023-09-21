export interface AttendanceReport{
  form: number
  stream: string
  streamid: number
  students: Array<{
    absent: number;
    present: number;
    present_percentage: number,
    name: string,
    userid: number,
    admno: string
  }>
  term: number;
  term_options: {
    current_year: number,
    current_term: number,
    terms_years: Array<{
      label: string,
      term: number,
      year: number
    }>
  }
  year: number
}
