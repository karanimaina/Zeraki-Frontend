import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AccountLockComponent } from "./account-lock/account-lock.component";
import { InvoiceComponent } from "./invoice/invoice.component";
import { LockComponent } from "./lock.component";
import { ProformaInvoiceComponent } from "./proforma-invoice/proforma-invoice.component";

const routes: Routes = [
	{
		path: "",
		component: LockComponent, 
		children: [
			{
				path:"lock", component:AccountLockComponent
			},
			{
				path:"proforma/:proformaid", component:ProformaInvoiceComponent
			},
			{
				path:"invoice/:invoiceid", component:InvoiceComponent
			},
			{
				path:"", redirectTo: "lock", pathMatch: "full"
			},
		] 
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class InvoiceRoutingModule { }
