import { Component, Input} from "@angular/core";
import { GradingSystemReport } from "src/app/@core/models/printouts/report-forms/grading-system-report";

@Component({
	selector: "app-grade-descriptors",
	templateUrl: "./grade-descriptors.component.html",
	styleUrls: ["./grade-descriptors.component.scss"]
})
export class GradeDescriptorsComponent {
	@Input() gradingSystems: GradingSystemReport[] = [];
}
