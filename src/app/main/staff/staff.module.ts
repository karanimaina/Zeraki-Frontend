import { NgModule } from "@angular/core";

import { StaffRoutingModule } from "./staff-routing.module";
import { StaffComponent } from "./staff.component";
import { AddStaffComponent } from "./add-staff/add-staff.component";
import { ManageStaffComponent } from "./manage-staff/manage-staff.component";
import { GroupsStaffComponent } from "./groups-staff/groups-staff.component";
import { StaffNavTopComponent } from "./staff-nav-top/staff-nav-top.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { SharedStaffModule } from "src/app/@core/shared/components/staff/shared-staff.module";
import { SchoolTypePipe } from "src/app/@core/shared/pipes/school-type.pipe";


@NgModule({
	declarations: [
		StaffComponent,
		AddStaffComponent,
		ManageStaffComponent,
		GroupsStaffComponent,
		StaffNavTopComponent,

	],
	exports: [
		ManageStaffComponent
	],
	imports: [
		StaffRoutingModule,
		NgSelectModule,
		SharedStaffModule,
		SharedModule,
		ReactiveFormsModule,
		FormsModule,
		SweetAlert2Module,
	],
	providers: [
		SchoolTypePipe
	]
})
export class StaffModule { }
