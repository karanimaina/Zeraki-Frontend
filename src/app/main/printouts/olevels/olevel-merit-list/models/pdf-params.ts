import { OlevelMeritList } from "./olevel-merit-list";

export interface PdfParams {
	meritList: OlevelMeritList;
	schoolLogo: string;
	classLevel: string;
	assessmentColumnLabels: string[];
	meritListTitle: string;
}
