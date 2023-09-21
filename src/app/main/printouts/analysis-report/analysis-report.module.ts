import { NgModule } from "@angular/core";

import { AnalysisReportRoutingModule } from "./analysis-report-routing.module";
import { AnalysisReportComponent } from "./analysis-report.component";
import { FormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { MatSortModule } from "@angular/material/sort";
import { HighchartsChartModule } from "highcharts-angular";
import { NgxPrintModule } from "ngx-print";


@NgModule({
	declarations: [
		AnalysisReportComponent
	],
	imports: [
		AnalysisReportRoutingModule,
		FormsModule,
		NgSelectModule,
		TranslateModule,
		SharedModule,
		HighchartsChartModule,
		MatSortModule,
		NgxPrintModule
	]
})
export class AnalysisReportModule { }
