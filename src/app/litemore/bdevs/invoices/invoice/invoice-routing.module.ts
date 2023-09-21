import {RouterModule, Routes} from "@angular/router";
import {InvoiceComponent} from "./invoice.component";
import {NgModule} from "@angular/core";
import {CreditNotesComponent} from "./credit-notes/credit-notes.component";
import {InvoiceListComponent} from "./invoice-list/invoice-list.component";

const routes: Routes = [
	{
		path: "",
		component: InvoiceComponent,
		children: [
			{
				path: "",
				component: InvoiceListComponent
			},
			{
				path: "credit-note/:invoiceId",
				component: CreditNotesComponent
			}
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InvoiceRoutingModule { }
