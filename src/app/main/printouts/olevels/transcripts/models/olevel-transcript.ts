import {StudentTranscript} from "./student-transcript";
import {OlevelGrade} from "../../models/olevel-grade";

export interface OlevelTranscript {
	streamName: string;
	year: string;
	term: string;
	transcripts: StudentTranscript[];
	classTeacherSignature: string;
	principalSignature: string;
	grades: OlevelGrade[];
}

/**
 * @description
 * Receives an array of terms and returns a string of the terms
 * in a readable format.
 *
 * @example
 * termName([1, 2, 3]) // returns "1, 2 and 3"
 * termName([1,2]) // returns "1 and 2"
 * termName([1]) // returns "1"
 *
 * @param terms
 */
export function termName(terms: string[] | number[]) {
	terms.sort();

	let termNames = "";
	terms.forEach((term, index) => {
		if (index === 0) {
			termNames = term.toString();
		} else if (index === terms.length - 1) {
			termNames = `${termNames} and ${term.toString()}`;
		} else {
			termNames = `${termNames}, ${term.toString()}`;
		}
	});

	return termNames;
}
