import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as schools from "./index";

const routes: Routes = [
	{
		path: "", component: schools.SchoolsComponent,
		children: [
			{ path: "type/:product", component: schools.SchoolsTypeComponent },
			// { path: "", redirectTo: "valid", pathMatch: "full" }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class SchoolsRoutingModule { }
