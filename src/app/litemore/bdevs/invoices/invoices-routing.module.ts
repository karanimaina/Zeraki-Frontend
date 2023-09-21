import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
// import { SchoolsTypeComponent } from "../../managers/schools";
import * as components from "./index";

const routes: Routes = [
	{
		path: "", component: components.InvoicesComponent,
		children: [
			{ path: "", component: components.ListComponent },
			{ path: ":school_id", loadChildren: () => import("./proforma/proforma.module").then(m => m.ProformaModule) },
			{ path: ":school_id/:proforma_id/:is_proforma_invoice", loadChildren: () => import("./invoice/invoice.module").then(m => m.InvoiceModule) },
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InvoicesRoutingModule { }
