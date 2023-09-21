import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as components from "../../index";

const routes: Routes = [
	{
		path: "",
		component: components.FormMappingsComponent,
		children: [
			{
				path: "",
				component: components.FormMappingsListComponent,
			}
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class FormMappingsRoutingModule { }
