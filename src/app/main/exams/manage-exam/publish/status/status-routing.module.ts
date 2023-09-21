import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as exams from "../../../index";

const routes: Routes = [
	{ path: ":streamId/:seriesId", component: exams.PublishStatusComponent },
	{ path: "st/:lock/:seriesId/:classId/:viewonly", component: exams.PublishSubjectStatusComponent },
	{ path: "upload/:classId/:seriesId/:lock", component: exams.UploadExamsSubjectComponent },
	{ path: "marklist/:seriesId/:classId/:intakeId/:streamId/:paperId", component: exams.MarklistComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class StatusRoutingModule { }
