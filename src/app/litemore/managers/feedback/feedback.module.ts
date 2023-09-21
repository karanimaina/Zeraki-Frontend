import { NgModule } from "@angular/core";

import { FeedbackRoutingModule } from "./feedback-routing.module";
import * as feedback from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";

@NgModule({
	declarations: [
		feedback.FeedbackComponent
	],
	imports: [
		FeedbackRoutingModule,
		SharedModule,
	]
})
export class FeedbackModule { }
