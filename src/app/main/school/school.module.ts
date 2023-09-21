import { NgModule } from "@angular/core";

import { SchoolRoutingModule } from "./school-routing.module";
import { SchoolComponent } from "./school.component";
import { LayoutModule } from "src/app/layout/layout.module";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		SchoolComponent
	],
	imports: [
		SchoolRoutingModule,
		SharedModule,
		LayoutModule
	]
})
export class SchoolModule { }
