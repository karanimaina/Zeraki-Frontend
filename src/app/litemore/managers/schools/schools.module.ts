import { NgModule } from "@angular/core";

import { SchoolsRoutingModule } from "./schools-routing.module";
import * as schools from "./index";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule } from "@angular/forms";
import { MatInputModule } from "@angular/material/input";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { SchoolMetricsModule } from "src/app/@core/shared/components/school-metrics/school-metrics.module";


@NgModule({
	declarations: [
		schools.SchoolsComponent,
		schools.SchoolsTypeComponent,
		schools.SchoolsFiltersComponent,
		schools.EditSenderidComponent,
	],
	imports: [
		FormsModule,
		SchoolsRoutingModule,
		NgSelectModule,
		MatInputModule,
		SharedModule,
		SchoolMetricsModule
	]
})
export class SchoolsModule { }
