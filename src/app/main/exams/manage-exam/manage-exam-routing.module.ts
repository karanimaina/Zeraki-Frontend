import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {OnlyAdminGuard} from "src/app/@core/shared/guards/only-admin.guard";
import * as exams from "../index";
import {ExamCoefficientComponent} from "./exam-coefficient/exam-coefficient.component";

const routes: Routes = [
	{ path: "", canActivate: [OnlyAdminGuard], component: exams.ManageExamComponent },
	{
		path: "analysis",
		loadChildren: () => import("./analysis/analysis.module").then(module => module.AnalysisModule)
	},
	{
		path: "publish",
		loadChildren: () => import("./publish/publish.module").then(module => module.PublishModule)
	},
	{
		path: "send-results",
		loadChildren: () => import("./send-results/send-results.module").then(module => module.SendResultsModule)
	},
	{path: "coefficient-system/:intakeId/:seriesId/:egroupId/:annualEgroupId", canActivate: [OnlyAdminGuard], component: ExamCoefficientComponent},
	// {path: "config/:intakeId/:seriesId", canActivate: [OnlyAdminGuard], component: exams.ConfigExamComponent},
	{path: "upload/:intakeId/:seriesId", canActivate: [OnlyAdminGuard], component: exams.UploadExamsComponent},
	{path: ":termIndex/:examIndex", canActivate: [OnlyAdminGuard], component: exams.ManageExamComponent},
	{
		path: "config",
		canActivate: [OnlyAdminGuard],
		loadChildren: () => import("./config-exam/config-exam.module").then(module => module.ConfigExamModule)
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ExamManagementRoutingModule { }
