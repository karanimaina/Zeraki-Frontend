import {Student} from "../student/student";

export interface ClassAttendance{
  date: string;
  form: number;
  session_number: number;
  stream: string;
  streamid: number;
  students: Student[];
  term: number;
}
