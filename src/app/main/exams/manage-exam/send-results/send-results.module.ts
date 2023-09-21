import { NgModule } from "@angular/core";

import { SendResultsRoutingModule } from "./send-results-routing.module";
import * as exams from "../../index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { FormsModule } from "@angular/forms";


@NgModule({
	declarations: [
		exams.SendResultsConsolidatedComponent,
		exams.SendResultsComponent,
	],
	imports: [
		FormsModule,
		SendResultsRoutingModule,
		SharedModule
	]
})
export class SendResultsModule { }
