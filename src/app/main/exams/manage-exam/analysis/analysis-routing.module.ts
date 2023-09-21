import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as exams from "../../index";

const routes: Routes = [
	{ 
		path: "subject",
		loadChildren: () => import("./subject/subject.module").then(module => module.AnalysisSubjectModule)
	},
	{ path: ":intakeid", component: exams.AnalysisComponent },
	{ path: ":intakeid/:streamid/:seriesid/:egroupid", component: exams.AnalysisComponent },
	{ path: ":intakeid/:streamid/:seriesid/:egroupid/:annual_egroup_id", component: exams.AnalysisComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AnalysisRoutingModule { }
