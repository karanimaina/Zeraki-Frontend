import { NgModule } from "@angular/core";
import { DatePipe } from "@angular/common";
import { NgxPrintModule } from "ngx-print";
import { NgSelectModule } from "@ng-select/ng-select";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "@danielmoncada/angular-datetime-picker";
import { HighchartsChartModule } from "highcharts-angular";
import { SharedModule } from "../../../@core/shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import * as components from "./index";
import { ReportFormsRoutingModule } from "./report-forms-routing.module";

@NgModule({
	exports: [],
	declarations: [
		components.ReportFormsComponent,
		components.CustomCommentsComponent,
		components.FeeStatusClosingDateComponent,
		components.RemarksComponent,
		components.ReportFormHeaderComponent,
		components.ReportTableComponent,
		components.StudentRankComponent,
		components.StudentTimelinePerformanceComponent,
		components.AggregateStatisticsComponent,
		components.GradeDescriptorsComponent,
	],
	imports: [
		ReportFormsRoutingModule,
		TranslateModule,
		FormsModule,
		NgxPrintModule,
		NgSelectModule,
		OwlDateTimeModule,
		OwlNativeDateTimeModule,
		HighchartsChartModule,
		SharedModule,
	],
	providers: [
		DatePipe
	]
})

export class ReportFormsModule { }
