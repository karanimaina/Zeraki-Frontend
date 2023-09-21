import {Intake} from "../intake/intake";

export interface ClassTeacher{
	streamid: number,
	name: string,
	email: string,
	destinations?: Array<Intake>
}
