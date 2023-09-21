import { Subjects } from "../classes/subject";

export interface OlevelIntakeStream {
	name: string; streamid: number; subjects: Array<Subjects>
}

export interface OlevelIntake {
	classlevel: number | string;
	intakeid: number;
	streams?: Array<OlevelIntakeStream>;
}
