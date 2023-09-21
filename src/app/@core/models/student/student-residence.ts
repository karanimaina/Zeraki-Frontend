// export interface StudentResidence {

// }

export interface ResidenceTeacher {
	id: number;
	name: string;
	tscNo: any;
}

export interface AddStudentResidencePayload {
  name: string;
  residenceTeacherId: number | null;
}

export interface UpdateStudentResidencePayload extends AddStudentResidencePayload {
  id: number;
}
