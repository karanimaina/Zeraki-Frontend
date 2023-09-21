import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as exams from "../index";

const routes: Routes = [
	{ path: "", component: exams.MyClassesComponent },
	{ path: "upload/results/subject/:classId/:seriesId/:lock", component: exams.UploadExamsSubjectComponent },
	{ path: ":classId/assessments", loadChildren: () => import("./assessments/assessments.module").then(m => m.AssessmentsModule) }
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class MyClassesRoutingModule { }
