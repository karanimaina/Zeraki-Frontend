import { NgModule } from "@angular/core";

import { ReportsRoutingModule } from "./reports-routing.module";
import { SharedModule } from "src/app/@core/shared/shared.module";
import * as reports from "./index";


@NgModule({
	declarations: [
		reports.ReportsComponent, 
		reports.ReportComponent, 
		reports.FiltersComponent
	],
	imports: [
		ReportsRoutingModule,
		SharedModule,
	]
})
export class ReportsModule { }
