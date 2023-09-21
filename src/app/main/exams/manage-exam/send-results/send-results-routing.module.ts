import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as exams from "../../index";

const routes: Routes = [
	{ path: ":intakeId/:examId", component: exams.SendResultsComponent },
	{ path: "egroup/:intakeId/:examId", component: exams.SendResultsConsolidatedComponent },
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SendResultsRoutingModule { }
