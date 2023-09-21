import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { StudentResidencesRoutingModule } from "./student-residences-routing.module";
import * as residences from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { StudentsTopNavModule } from "../@components/students-top-nav/students-top-nav.module";

@NgModule({
	declarations: [
		residences.StudentResidencesComponent,
		residences.StudentHouseListComponent
	],
	imports: [
		CommonModule,
		StudentResidencesRoutingModule,
		SharedModule,
		StudentsTopNavModule
	]
})
export class StudentResidencesModule {}
