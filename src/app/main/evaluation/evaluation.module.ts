import { NgModule } from "@angular/core";
import { CreateEvaluationComponent } from "./create-evaluation/create-evaluation.component";
import { EvaluationRoutingModule } from "./evaluation-routing.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { AllEvaluationsComponent } from "./all-evaluations/all-evaluations.component";
import { EvaluationComponent } from "./evaluation.component";
import { SharedModule } from "../../@core/shared/shared.module";
import { EvaluationTopNavComponent } from "./evaluation-top-nav/evaluation-top-nav.component";
import { UploadResultsComponent } from "./upload-results/upload-results.component";
import { ManageEvaluationComponent } from "./manage-evaluation/manage-evaluation.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SingleEvaluationComponent } from "./_components/single-evaluation/single-evaluation.component";
import { NewStudentRowComponent } from "./_components/new-student-row/new-student-row.component";
import { SweetAlertContentComponent } from "./_components/sweet-alert-content/sweet-alert-content.component";
import { NewAssessmentComponent } from "./_components/new-assessment/new-assessment.component";



@NgModule({
	declarations: [
		EvaluationComponent,
		CreateEvaluationComponent,
		AllEvaluationsComponent,
		EvaluationTopNavComponent,
		UploadResultsComponent,
		ManageEvaluationComponent,
		SingleEvaluationComponent,
		NewStudentRowComponent,
		SweetAlertContentComponent,
		NewAssessmentComponent
	],
	imports: [
		EvaluationRoutingModule,
		NgSelectModule,
		SharedModule,
		MatTooltipModule,
		FormsModule,
		ReactiveFormsModule
	]
})
export class EvaluationModule { }
