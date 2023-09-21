import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AssessmentsComponent } from "./assessments.component";
import { AssessmentsListComponent } from "./pages";

const routes: Routes = [
	{
		path: "",
		component: AssessmentsComponent,
		children: [
			{
				path: "",
				component: AssessmentsListComponent,
			},
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class AssessmentsRoutingModule { }
