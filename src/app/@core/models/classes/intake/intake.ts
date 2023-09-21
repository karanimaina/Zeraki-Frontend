import {ClassStream} from "../stream/class-stream";

export interface Intake{
	intakeid: number,
	form: number,
	streams: Array<ClassStream>,
	class_level?: number
	is_graduated?: boolean
	label?: string
}
