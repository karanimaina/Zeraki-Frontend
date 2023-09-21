import { NgModule } from "@angular/core";

import { SubjectPaperRatiosRoutingModule } from "./subject-paper-ratios-routing.module";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { SubjectPaperRatiosComponent } from "../index";


@NgModule({
	declarations: [
		SubjectPaperRatiosComponent
	],
	imports: [
		SubjectPaperRatiosRoutingModule,
		SharedModule
	]
})
export class SubjectPaperRatiosModule { }
