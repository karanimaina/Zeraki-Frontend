import {Component, Input, OnInit} from "@angular/core";
import {SubjectReport} from "../../models/subject-report";

@Component({
	selector: "app-subject-results",
	templateUrl: "./subject-results.component.html",
	styleUrls: ["../student-report/student-report.component.scss"]
})
export class SubjectResultsComponent implements OnInit {
	@Input() showCompetencyAreas!: boolean;
	@Input() evaluationSeries: Array<{
		seriesId: number;
		seriesName: string;
	}> = [];
	@Input() showRawScore!: boolean;
	@Input() showScoreDescriptor!: boolean;
	@Input() showSubjectTeacherComments!: boolean;
	@Input() showExamsSlot!: boolean;
	@Input() subjects: SubjectReport[] = [];
	@Input() primaryColour!: string;
	@Input() evaluationMark!: number | undefined;
	printFontSize = 12;

	constructor() { }

	ngOnInit(): void {
	}

}
