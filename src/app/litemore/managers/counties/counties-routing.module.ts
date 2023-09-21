import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CountiesComponent } from "./counties.component";
import { CountyListComponent } from "./pages/county-list/county-list.component";

const routes: Routes = [
	{
		path: "",
		component: CountiesComponent,
		children: [
			{ path: "", component: CountyListComponent }
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CountiesRoutingModule { }
