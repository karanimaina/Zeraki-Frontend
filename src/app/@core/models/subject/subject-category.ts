import { ClassSubject } from "./class-subject";

export interface SubjectCategory {
	id: number,
	name: string,
	subjects: Array<ClassSubject>
}
