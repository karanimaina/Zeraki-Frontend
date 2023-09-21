import { NgModule } from "@angular/core";

import { JointAccountRoutingModule } from "./joint-account-routing.module";
import { JointAccountComponent } from "./joint-account.component";
import { LayoutModule } from "../layout/layout.module";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "../@core/shared/shared.module";
import { AnalysisComponent } from "./analysis/analysis.component";
import { MeritListComponent } from "./merit-list/merit-list.component";
import { HighchartsChartModule } from "highcharts-angular";
import { ClassReportComponent } from "./class-report/class-report.component";


@NgModule({
	declarations: [
		JointAccountComponent,
		AnalysisComponent,
		MeritListComponent,
		ClassReportComponent,
	],
	imports: [
		JointAccountRoutingModule,
		LayoutModule,
		TranslateModule,
		SharedModule,
		HighchartsChartModule
	]
})
export class JointAccountModule { }
