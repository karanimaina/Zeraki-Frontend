import { NgModule } from "@angular/core";

import { BomRoutingModule } from "./bom-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import * as bom from "./index";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { SharedStaffModule } from "src/app/@core/shared/components/staff/shared-staff.module";
import { SchoolTypePipe } from "src/app/@core/shared/pipes/school-type.pipe";
import { SchoolTypeWithParamsPipe } from "src/app/@core/shared/pipes/school-type-with-params.pipe";


@NgModule({
	declarations: [
		bom.BomComponent,
		bom.BomTopNavComponent,
		bom.BomAddComponent,
		bom.BomGroupsComponent,
		bom.ManageBomComponent
	],
	imports: [
		BomRoutingModule,
		SharedStaffModule,
		SharedModule,
		NgSelectModule,
		ReactiveFormsModule,
		FormsModule,
		SweetAlert2Module,
	],
	providers: [
		SchoolTypePipe, SchoolTypeWithParamsPipe
	]
})
export class BomModule { }
