import {OlevelExamReportBase} from "./olevel-exam-report-base";

export interface OlevelExamReport extends OlevelExamReportBase {
  studentsResults: Array<{ [key: string]: string | number }>;
}
