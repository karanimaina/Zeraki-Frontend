import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ShopRoutingModule } from "./shop-routing.module";
import { ShopComponent } from "./shop.component";
import { ShopTopNavComponent } from "./shop-top-nav/shop-top-nav.component";
import { TranslateModule } from "@ngx-translate/core";


@NgModule({
	declarations: [
		ShopComponent,
		ShopTopNavComponent
	],
	imports: [
		CommonModule,
		ShopRoutingModule,
		TranslateModule
	]
})
export class ShopModule { }
