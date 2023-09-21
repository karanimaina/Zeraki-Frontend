import {NgModule} from "@angular/core";
import {RouterModule, Routes} from "@angular/router";
import {SubjectPapersComponent} from "./pages";
import {SharedModule} from "../../../../@core/shared/shared.module";
import {SubjectPapersTableComponent} from "./components";

const routes: Routes = [
	{
		path: ":intakeId/:seriesId",
		component: SubjectPapersComponent
	}
];

@NgModule({
	declarations: [
		SubjectPapersComponent,
		SubjectPapersTableComponent
	],
	imports: [
		SharedModule,
		RouterModule.forChild(routes)
	],
	exports: []
})
export class ConfigExamModule { }
