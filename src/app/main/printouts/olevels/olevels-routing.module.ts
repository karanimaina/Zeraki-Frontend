import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import { OnlyTeacherGuard } from "src/app/@core/shared/guards/only-teacher.guard";
import * as printout from "../index";

const routes: Routes = [
	{
		path: "report-forms",
		loadChildren: () => import("./olevel-report-forms/olevel-report-forms.module").then(m => m.OlevelReportFormsModule),
	},
	{
		path: "evaluation-report",
		component: printout.EvaluationReportComponent,
		canActivate: [OnlyTeacherGuard]
	},
	{
		path: "assessments",
		component: printout.AssessmentsComponent,
		canActivate: [OnlyAdminGuard]
	},
	{
		path: "merit-list",
		loadChildren: () => import("./olevel-merit-list/olevel-merit-list.module").then(m => m.OlevelMeritListModule),
		canActivate: [OnlyAdminGuard]
	},
	{
		path: "transcripts",
		loadChildren: () => import("./transcripts/transcripts.module").then(m => m.TranscriptsModule),
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class OlevelsRoutingModule { }
