import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";

import { BehaviourRoutingModule } from "./behaviour-routing.module";
import * as behaviour from "./index";
import { IntakeBehaviourComponent } from "./intake-behaviour/intake-behaviour.component";
import { StreamBehaviourComponent } from "./stream-behaviour/stream-behaviour.component";
import { ResidenceStudentBehaviourComponent } from "./residence-student-behaviour/residence-student-behaviour.component";
import { ChartModule, HIGHCHARTS_MODULES } from "angular-highcharts";
import { HighchartsChartModule } from "highcharts-angular";
import more from "highcharts/highcharts-more.src";
import solidGauge from "highcharts/modules/solid-gauge.src";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";

export function highchartsModules() {
	// apply Highcharts Modules to this array
	return [more, solidGauge];
}

@NgModule({
	declarations: [
		behaviour.BehaviourComponent,
		behaviour.ClassBehaviourComponent,
		behaviour.BehaviourTopNavComponent,
		behaviour.ResidenceBehaviourComponent,
		behaviour.NewRecordComponent,
		behaviour.InfractionsApprovalComponent,
		behaviour.ManageBehaviourComponent,
		behaviour.StudentBehaviourComponent,
		IntakeBehaviourComponent,
		StreamBehaviourComponent,
		ResidenceStudentBehaviourComponent
	],
	imports: [
		BehaviourRoutingModule,
		FormsModule,
		SharedModule,
		ReactiveFormsModule,
		NgSelectModule,
		ChartModule,
		HighchartsChartModule,
		TranslateModule
	],
	providers: [
		{ provide: HIGHCHARTS_MODULES, useFactory: highchartsModules } // add as factory to your providers
	]
})
export class BehaviourModule { }
