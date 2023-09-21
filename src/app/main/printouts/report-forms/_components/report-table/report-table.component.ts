/* eslint-disable no-mixed-spaces-and-tabs */
import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {StudentReport} from "../../../../../@core/models/printouts/report-forms/student-report";
import {SchoolTypes} from "../../../../../@core/enums/school-types";
import {SchoolTypeData} from "../../../../../@core/models/school-type-data";
import {
	PerformancePerSubject
} from "../../../../../@core/models/printouts/report-forms/subjects/performance-per-subject";

@Component({
	selector: "app-report-table",
	templateUrl: "./report-table.component.html",
	styleUrls: ["./report-table.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportTableComponent {

	@Input() studentReport!: StudentReport;
	@Input() showOverallStudentRank!: boolean;
	@Input() showStudentStreamRank!: boolean;
	@Input() showCustomComments!: boolean;
	@Input() showGPA?: boolean;
	@Input() schoolTypeData!:SchoolTypeData;

	schoolTypes = SchoolTypes;

	trackBySubjectId(index: number, subject: PerformancePerSubject): number {
		return subject.subjectId;
	}

}
