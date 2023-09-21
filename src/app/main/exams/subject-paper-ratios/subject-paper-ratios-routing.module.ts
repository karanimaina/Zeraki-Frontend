import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as exams from "../index";

const routes: Routes = [
	{ path: "", component: exams.SubjectPaperRatiosComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SubjectPaperRatiosRoutingModule { }
