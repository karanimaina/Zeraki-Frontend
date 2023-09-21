export interface EvaluationList{
  subjectName: string;
  classId: number;
  classLevel: number;
  streamId: number;
  streamName: string;
  year: number;
  terms: Array<{
    term: number;
    evaluations: Array<Evaluation>;
    exams: Array<Evaluation>;
    projects: Array<Evaluation>;
  }>
}

export interface Evaluation{
  evaluationId: number;
  evaluationName: string;
  withResults: number;
  population: number;
  uploadStatus: boolean;

  //Project
  projectId: number;
  projectName: string;
}
