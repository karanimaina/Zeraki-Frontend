import { NgModule } from "@angular/core";

import { AssessmentsRoutingModule } from "./assessments-routing.module";
import { AssessmentCreationComponent } from "./components";
import { AssessmentsListComponent } from "./pages";
import { AssessmentsComponent } from "./assessments.component";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		AssessmentsComponent,
		AssessmentsListComponent,
		AssessmentCreationComponent,
	],
	imports: [
		SharedModule,
		AssessmentsRoutingModule
	]
})
export class AssessmentsModule { }
