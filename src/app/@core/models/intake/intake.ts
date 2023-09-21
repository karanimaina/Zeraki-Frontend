import { ClassSubject } from "../subject/class-subject";

export interface Intake {
	classlevel: number,
	intakeid: number,
	streams: Array<Stream>,
	name?: string;
}

interface Stream {
	streamid: number
	name: string
	subjects: Array<ClassSubject>
}
