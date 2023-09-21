import { NgModule } from "@angular/core";

import { BannersRoutingModule } from "./banners-routing.module";
import { BannersComponent } from "./banners.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { BannerAdditionComponent } from ".";


@NgModule({
	declarations: [
		BannersComponent,
		BannerAdditionComponent,
	],
	imports: [
		SharedModule,
		BannersRoutingModule
	]
})
export class BannersModule { }
