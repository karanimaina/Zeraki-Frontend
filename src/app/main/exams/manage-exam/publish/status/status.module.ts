import { NgModule } from "@angular/core";

import { StatusRoutingModule } from "./status-routing.module";
import * as exams from "../../../index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { MatSortModule } from "@angular/material/sort";


@NgModule({
	declarations: [
		exams.PublishStatusComponent,
		exams.PublishSubjectStatusComponent,
		exams.MarklistComponent
	],
	imports: [
		StatusRoutingModule,
		SharedModule,
		MatSortModule
	]
})
export class StatusModule { }
