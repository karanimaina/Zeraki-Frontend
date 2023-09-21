import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import * as partners from "./index";

const routes: Routes = [
	{
		path: "", component: partners.PartnersComponent,
		children: [
			{ path: "list", component: partners.PartnerListComponent },
			{ path: "requests", component: partners.PartnerRequestsComponent },
			{ path: "", redirectTo: "list", pathMatch: "full" }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class PartnersRoutingModule { }
