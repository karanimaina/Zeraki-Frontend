import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { NgxPrintModule } from "ngx-print";
import * as staff from "./index";
import { SharedModule } from "../../shared.module";


@NgModule({
	declarations: [
		staff.ManageStaffComponent,
		staff.StaffGroupsComponent,
		staff.EditTeacherComponent,
		staff.ListTeachersComponent,
		staff.SearchTeachersComponent
	],
	imports: [
		FormsModule,
		ReactiveFormsModule,
		NgSelectModule,
		TranslateModule,
		NgxPrintModule,
		SharedModule,
	],
	exports: [
		staff.ManageStaffComponent,
		staff.StaffGroupsComponent
	]
})
export class SharedStaffModule { }


