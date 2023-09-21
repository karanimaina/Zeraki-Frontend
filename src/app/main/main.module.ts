import { NgModule } from "@angular/core";
import { NgScrollbarModule } from "ngx-scrollbar";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { MainRoutingModule } from "./main-routing.module";

import { MainComponent } from "./main.component";
import { LayoutModule } from "../layout/layout.module";
import { SharedModule } from "../@core/shared/shared.module";
import { SchoolService } from "../@core/shared/services/school/school.service";
import { SwitchingSchoolComponent } from "./switching-school/switching-school.component";

@NgModule({
	declarations: [
		MainComponent,
		SwitchingSchoolComponent
	],
	imports: [
		LayoutModule,
		NgScrollbarModule,
		ScrollingModule,
		SharedModule,
		MainRoutingModule
	],
	providers: [
		SchoolService
	]
})
export class MainModule { }
