import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MeritListComponent } from "./merit-list/merit-list.component";
import { AnalysisComponent } from "./analysis/analysis.component";
import { JointAccountComponent } from "./joint-account.component";

const routes: Routes = [
	{path:"", component:JointAccountComponent,
		children:[
			{
				path:"h",component:AnalysisComponent
			},
			{
				path:"h/merit-list/:schoolid/:subjectid",component:MeritListComponent
			},
			{
				path:"",redirectTo:"h",pathMatch:"full"
			}
		]}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class JointAccountRoutingModule { }
