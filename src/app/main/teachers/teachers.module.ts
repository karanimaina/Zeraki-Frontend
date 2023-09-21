import { NgModule } from "@angular/core";
import { MatTableModule } from "@angular/material/table";

import { TeachersRoutingModule } from "./teachers-routing.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import * as teachers from "./index";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { SharedModule } from "../../@core/shared/shared.module";
import { SharedStaffModule } from "src/app/@core/shared/components/staff/shared-staff.module";
import { SchoolTypePipe } from "src/app/@core/shared/pipes/school-type.pipe";

@NgModule({
	declarations: [
		teachers.TeachersComponent,
		teachers.AddTeacherComponent,
		teachers.TeacherGroupsComponent,
		teachers.ManageTeachersComponent,
		teachers.TeacherTopNavComponent,
		teachers.TeacherClassesComponent,
	],
	exports: [
		teachers.ManageTeachersComponent,
		teachers.AddTeacherComponent,
	],
	imports: [
		TeachersRoutingModule,
		SharedStaffModule,
		NgSelectModule,
		FormsModule,
		ReactiveFormsModule,
		MatTableModule,
		SweetAlert2Module,
		SharedModule,
	],
	providers: [
		SchoolTypePipe
	]
})
export class TeachersModule { }
