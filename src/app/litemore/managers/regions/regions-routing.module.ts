import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { RegionListComponent } from "./pages/region-list/region-list.component";
import { RegionsComponent } from "./regions.component";

const routes: Routes = [
	{
		path: "",
		component: RegionsComponent,
		children: [
			{ path: "", component: RegionListComponent, }
		]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class RegionsRoutingModule { }
