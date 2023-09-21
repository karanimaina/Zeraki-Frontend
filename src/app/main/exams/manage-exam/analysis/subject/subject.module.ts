import { NgModule } from "@angular/core";

import { AnalysisSubjectRoutingModule } from "./subject-routing.module";
import * as exams from "../../../index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { HighchartsChartModule } from "highcharts-angular";
import { AnalysisModule } from "../analysis.module";


@NgModule({
	declarations: [
		exams.AnalysisSubjectComponent,
		exams.AnalysisSubjectMeritListComponent,
	],
	imports: [
		AnalysisSubjectRoutingModule,
		HighchartsChartModule,
		SharedModule,
		AnalysisModule,
	]
})
export class AnalysisSubjectModule { }
