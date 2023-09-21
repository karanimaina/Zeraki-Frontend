import { Component, OnInit } from "@angular/core";
import { AssessmentReport } from "../../../@core/models/evaluation/assessment-report";
import { EvaluationService } from "../../../@core/services/exams/evaluations/evaluation.service";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { SchoolTypeData } from "../../../@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import { AssessmentType } from "src/app/@core/enums/assessments/assessment-type";

@Component({
	selector: "app-olevel-summary-report",
	templateUrl: "./olevel-summary-report.component.html",
	styleUrls: ["./olevel-summary-report.component.scss"]
})
export class OlevelSummaryReportComponent implements OnInit {
	readonly AssessmentType = AssessmentType;

	assessmentReport!: AssessmentReport;
	errorMessage!: string;
	schoolTypeData?: SchoolTypeData;
	userRoles!: Role;

	constructor(private evaluationService: EvaluationService,
		private dataService: DataService,
		private translate: TranslateService,
		private rolesService: RolesService) {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});

		this.rolesService.roleSubject.subscribe((role) => {
			this.userRoles = role;
		});
	}

	ngOnInit(): void {
		this.getAssessmentReport();
	}

	private getAssessmentReport() {
		this.errorMessage = "";
		this.evaluationService.getAssessmentReport().subscribe(
			(res) => {
				this.assessmentReport = res;
			},
			(err) => {
				this.errorMessage = this.translate.instant("dashboard.olevelSummary.errorOccurred", { reason: err.error.response.message });
			}
		);
	}
}
