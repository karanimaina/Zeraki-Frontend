import { NgModule } from "@angular/core";

import { PublishRoutingModule } from "./publish-routing.module";
import { SharedModule } from "src/app/@core/shared/shared.module";
import * as exams from "../../index";
import { ClassesModule } from "../../my-classes/my-classes.module";
import { ExamsModule } from "../../exams.module";


@NgModule({
	declarations: [
		exams.PublishExamsComponent,
		exams.ResultsPublishCsComponent,
		exams.PublishGuineaTermAverageComponent,
		exams.PublishExamConsolidatedComponent,
	],
	imports: [
		PublishRoutingModule,
		SharedModule,
		ClassesModule,
		ExamsModule
	]
})
export class PublishModule { }
