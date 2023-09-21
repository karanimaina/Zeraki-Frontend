import { NgModule } from "@angular/core";
import { EvaluationReportComponent } from "./evaluation-report/evaluation-report.component";
import { AssessmentsComponent } from "./assessments/assessments.component";
import { NgxPrintModule } from "ngx-print";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { SharedModule } from "../../../@core/shared/shared.module";
import { OlevelsRoutingModule } from "./olevels-routing.module";
import {
	YearSummaryComponent,
	ReportSignaturesComponent,
	SchoolAddressComponent,
	StudentDetailsComponent,
	AttendanceReportComponent, GradeDescriptorComponent
} from "./components";
import { SchoolDetailsComponent } from "./components/school-details/school-details.component";

@NgModule({
	declarations: [
		EvaluationReportComponent,
		AssessmentsComponent,
		YearSummaryComponent,
		ReportSignaturesComponent,
		AttendanceReportComponent,
		StudentDetailsComponent,
		SchoolAddressComponent,
		GradeDescriptorComponent,
		SchoolDetailsComponent
	],
	imports: [
		OlevelsRoutingModule,
		NgxPrintModule,
		ReactiveFormsModule,
		NgSelectModule,
		FormsModule,
		SharedModule
	],
	exports: [
		SchoolAddressComponent,
		StudentDetailsComponent,
		AttendanceReportComponent,
		ReportSignaturesComponent,
		YearSummaryComponent,
		GradeDescriptorComponent,
		SchoolDetailsComponent
	]
})
export class OlevelReportsModule { }
