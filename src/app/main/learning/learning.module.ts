import { NgModule } from "@angular/core";

import { LearningRoutingModule } from "./learning-routing.module";
import { LearningComponent } from "./learning.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { TranslateModule } from "@ngx-translate/core";


@NgModule({
	declarations: [
		LearningComponent
	],
	imports: [
		SharedModule,
		LearningRoutingModule,
		TranslateModule
	]
})
export class LearningModule { }
