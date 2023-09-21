import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as exams from "../../../index";

const routes: Routes = [
	{ path: "merit-list/:seriesid/:egroupid/:subjectid/:intakeid/:classid", component: exams.AnalysisSubjectMeritListComponent },
	{ path: ":seriesid/:egroupid/:subjectid/:intakeid/:classid/:lock", component: exams.AnalysisSubjectComponent },
	{ path: ":seriesid/:egroupid/:subjectid/:intakeid/:classid/:lock/:major/:annual_egroup_id", component: exams.AnalysisSubjectComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AnalysisSubjectRoutingModule { }
