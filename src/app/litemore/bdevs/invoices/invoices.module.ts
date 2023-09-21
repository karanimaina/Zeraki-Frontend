import { NgModule } from "@angular/core";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule } from "@angular/forms";

import { InvoicesRoutingModule } from "./invoices-routing.module";
import * as components from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { SchoolMetricsModule } from "src/app/@core/shared/components/school-metrics/school-metrics.module";


@NgModule({
	declarations: [
		components.InvoicesComponent,
		components.FilterComponent,
		components.ListComponent
	],
	imports: [
		InvoicesRoutingModule,
		NgSelectModule,
		FormsModule,
		SharedModule,
		SchoolMetricsModule,
	]
})
export class InvoicesModule { }
