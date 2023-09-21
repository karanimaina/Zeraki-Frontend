import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CountriesComponent } from "./countries.component";
import { CountryListComponent } from "./country-list/country-list.component";
import { CountryAddComponent } from "./country-add/country-add.component";
import { CountryViewComponent } from "./country-view/country-view.component";
import { CountryUpdateComponent } from "./country-update/country-update.component";

const routes: Routes = [
	{
		path: "", component: CountriesComponent,
		children: [
			{ path: "", component: CountryListComponent, },
			{ path: "add", component: CountryAddComponent },
			{ path: ":id", component: CountryViewComponent },
			{ path: ":id/edit", component: CountryUpdateComponent },
		]
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class CountriesRoutingModule {
}
