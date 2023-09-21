import { NgModule } from "@angular/core";

import { CoefficientSystemRoutingModule } from "./coefficient-system-routing.module";
import { CoefficientSystemComponent } from "./coefficient-system.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { ExamsModule } from "../exams.module";


@NgModule({
	declarations: [
		CoefficientSystemComponent
	],
	imports: [
		CoefficientSystemRoutingModule,
		SharedModule,
		ExamsModule,
	]
})
export class CoefficientSystemModule { }
