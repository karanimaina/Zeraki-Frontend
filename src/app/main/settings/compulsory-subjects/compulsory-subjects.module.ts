import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import {AddSubjectComponent, SubjectsListComponent} from "./index";
import {RouterModule, Routes} from "@angular/router";
import {SharedModule} from "../../../@core/shared/shared.module";

const routes: Routes = [
	{
		path: "",
		component: SubjectsListComponent
	},
	{
		path: "add",
		component: AddSubjectComponent
	}
];

@NgModule({
	declarations: [
		SubjectsListComponent,
		AddSubjectComponent
	],
	imports: [
		CommonModule,
		RouterModule.forChild(routes),
		SharedModule
	]
})
export class CompulsorySubjectsModule { }
