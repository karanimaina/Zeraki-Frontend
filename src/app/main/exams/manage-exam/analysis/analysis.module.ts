import { NgModule } from "@angular/core";

import { AnalysisRoutingModule } from "./analysis-routing.module";
import * as exams from "../../index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { HighchartsChartModule } from "highcharts-angular";
import { MatSortModule } from "@angular/material/sort";
import { NgxPrintModule } from "ngx-print";


@NgModule({
	declarations: [
		exams.AnalysisComponent,
		exams.ClassAnalysisComponent,
		exams.AnalyticsGuineaTopViewComponent,
		exams.AnalysisReportGuineaTopViewComponent
	],
	imports: [
		AnalysisRoutingModule,
		HighchartsChartModule,
		MatSortModule,
		SharedModule,
		NgxPrintModule
	],
	exports: [
		exams.AnalyticsGuineaTopViewComponent
	]
})
export class AnalysisModule { }
