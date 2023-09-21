import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { NgApexchartsModule } from "ng-apexcharts";
import { FinanceRoutingModule } from "./finance-routing.module";
import * as components from "./index";
import { NgSelectModule } from "@ng-select/ng-select";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { StudentModule } from "./student/student.module";

@NgModule({
	declarations: [
		components.FinanceComponent,
		components.FeeStructureComponent,
		components.FeeStructureViewComponent,
		components.PDashboardComponent,
		components.StreamBalanceComponent,
		components.IntakeBalanceComponent,
	],
	imports: [
		FormsModule,
		SharedModule,
		FinanceRoutingModule,
		NgApexchartsModule,
		NgSelectModule,
		TranslateModule,
		StudentModule
	]
})
export class FinanceModule { }
