import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { OnlyAdminGuard } from "src/app/@core/shared/guards/only-admin.guard";
import * as exams from "../../index";

const routes: Routes = [
	{ path: "status",
		loadChildren: () => import("./status/status.module").then(module => module.StatusModule)},
	{ path: ":intakeId/:seriesId", canActivate: [OnlyAdminGuard], component: exams.PublishExamsComponent },
	{ path: "egroup/:intakeId/:examId", canActivate: [OnlyAdminGuard], component: exams.PublishExamConsolidatedComponent },
	{ path: "term-average/:intakeId/:examId/:type", canActivate: [OnlyAdminGuard], component: exams.PublishGuineaTermAverageComponent },
	{ path: "cs/:seriesid/:intakeid/:lock/:viewonly", component: exams.ResultsPublishCsComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PublishRoutingModule { }
