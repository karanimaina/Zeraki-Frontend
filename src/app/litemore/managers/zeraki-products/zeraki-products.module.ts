import { NgModule } from "@angular/core";
import * as zerakiProducts from "./index";
import { ZerakiProductsRoutingModule } from "./zeraki-products-routing.module";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { MatPaginatorModule } from "@angular/material/paginator";


@NgModule({
	declarations: [
		zerakiProducts.ZerakiProductsComponent,
		zerakiProducts.SchoolSearchResultsComponent,
	],
	imports: [
		SharedModule,
		ZerakiProductsRoutingModule,
		MatPaginatorModule,
	]
})
export class ZerakiProductsModule { }
