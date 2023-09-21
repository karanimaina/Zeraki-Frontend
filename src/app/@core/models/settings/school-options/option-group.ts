import {SchoolOption} from "./school-option";

export interface OptionGroup {
	groupId: number,
	title: string,
	options: Array<SchoolOption>
}
