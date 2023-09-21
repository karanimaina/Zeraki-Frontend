import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CreateEvaluationComponent } from "./create-evaluation/create-evaluation.component";
import { AllEvaluationsComponent } from "./all-evaluations/all-evaluations.component";
import { EvaluationComponent } from "./evaluation.component";
import { UploadResultsComponent } from "./upload-results/upload-results.component";
import { ManageEvaluationComponent } from "./manage-evaluation/manage-evaluation.component";
import { NetworkGuard } from "src/app/@core/shared/guards/network/network.guard";

const routes: Routes = [
	{
		path: "",
		component: EvaluationComponent, canActivateChild: [NetworkGuard],
		children: [
			{
				path: "create/:classId", component: CreateEvaluationComponent
			},
			{
				path: "all", component: AllEvaluationsComponent, data: { state: "evaluation" }
			},
			{
				path: "exams", component: AllEvaluationsComponent, data: { state: "exam" }
			},
			{
				path: "projects", component: AllEvaluationsComponent, data: { state: "project" }
			},
			{
				path: "upload/:id", component: UploadResultsComponent
			},
			{
				path: "manage/:evaluation", component: ManageEvaluationComponent
			},
			{
				path: "", redirectTo: "all", pathMatch: "full"
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EvaluationRoutingModule { }
