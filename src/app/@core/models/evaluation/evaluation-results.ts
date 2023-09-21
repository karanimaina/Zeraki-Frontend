export interface EvaluationResults {
  //For Evaluation
  evaluationId: number;
  maxScore: number;
  evaluationName: string;
  //For Exam
  examId: number;
  examName: string;
  //For Project
  projectId: number;
  projectName: string;

  results: Array<StudentResult>
}

export interface StudentResult{
  comment: string;
  factId: number;
  rawMark: number;
  score: number;
  studentAdmNo: string;
  studentId: number;
  studentName: string;
}
