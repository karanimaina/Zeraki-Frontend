export interface ClassSubject {
	intCode: number
	name: string
	subjectId: number
	textCode: string
	categoryId: number
	newCurriculum?: boolean
	category: SubjectCategory
}

interface SubjectCategory {
	id: number
	name: string
}
