import {Choice} from "./choice";

export interface SchoolOption {
	id: number,
	title: string,
	tag: string,
	text: string,
	isBoolean: boolean,
	isEnum: boolean,
	warningTitle: string,
	warningMessage: string,
	choices: Array<number[] | Choice[]>,
	value: number
}
