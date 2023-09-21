import { NgModule } from "@angular/core";

import { ShopPaymentsRoutingModule } from "./shop-payments-routing.module";
import * as shopPayments from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		shopPayments.ShopPaymentsComponent,
	],
	imports: [
		SharedModule,
		ShopPaymentsRoutingModule
	]
})
export class ShopPaymentsModule { }
