export interface SubjectCoefficient {
    majorId: number;
    subjectId: number;
    subjectName: string;
    classWeight: {[key: number]: string};
}
