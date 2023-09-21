import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ZerakiProductsComponent } from "./zeraki-products.component";
import {SchoolSearchResultsComponent} from "./school-search-results/school-search-results.component";

const routes: Routes = [
	{
		path: "",
		component: ZerakiProductsComponent,
		children: [
			{
				path: "search",
				component: SchoolSearchResultsComponent,
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ZerakiProductsRoutingModule { }
