import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { EducationSystemsListComponent, EducationSystemsComponent } from "./index";

const routes: Routes = [
	{
		path: "", component: EducationSystemsComponent,
		children: [
			{
				path: "", component: EducationSystemsListComponent,
			},
			{
				path: ":educationSystemId/form-mappings", loadChildren: () => import("./pages/form-mappings/form-mappings.module").then(m => m.FormMappingsModule),
			},
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class EducationSystemsRoutingModule { }
