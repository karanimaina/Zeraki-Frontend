import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ShopPaymentsComponent } from "./shop-payments.component";

const routes: Routes = [{ path: "", component: ShopPaymentsComponent }];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ShopPaymentsRoutingModule { }
