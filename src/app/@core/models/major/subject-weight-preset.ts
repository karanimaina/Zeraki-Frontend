import {SubjectCoefficient} from "./subject-coefficient";
import {FormWeight} from "./form-weight";

export interface SubjectWeightPreset{
	majorId: number,
	majorName: string,
	majorTextCode: number,
	subjectId: number,
	subjectName: string,
	grade7Weight: number,
	grade8Weight: number,
	grade9Weight: number,
	grade10Weight: number,
	grade11Weight: number,
	grade12Weight: number,
	grade13Weight: number
}

export interface CoefficientSystem{
	coefficients: SubjectCoefficient[],
	forms: FormWeight[]
}
