import { NgModule } from "@angular/core";
import { CreateExamComponent } from "./index";
import {
	ConsolidatedExamsComponent,
	KcseExamsComponent,
	OrdinaryExamComponent,
	YearAverageExamsComponent,
	TermAverageComponent
} from "./components";
import { RouterModule, Routes } from "@angular/router";
import { ReactiveFormsModule } from "@angular/forms";
import { SharedModule } from "../../../@core/shared/shared.module";

const routes: Routes = [
	{
		path: "",
		component: CreateExamComponent
	}
];
@NgModule({
	declarations: [
		CreateExamComponent,
		ConsolidatedExamsComponent,
		KcseExamsComponent,
		OrdinaryExamComponent,
		YearAverageExamsComponent,
		TermAverageComponent
	],
	imports: [
		RouterModule.forChild(routes),
		ReactiveFormsModule,
		SharedModule
	],
	exports: []
})
export class CreateExamModule { }
