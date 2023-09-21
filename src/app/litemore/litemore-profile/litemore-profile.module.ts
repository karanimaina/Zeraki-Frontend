import { NgModule } from "@angular/core";

import { LitemoreProfileRoutingModule } from "./litemore-profile-routing.module";
import { LitemoreProfileComponent } from "./litemore-profile.component";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		LitemoreProfileComponent
	],
	imports: [
		LitemoreProfileRoutingModule,
		SharedModule
	]
})
export class LitemoreProfileModule { }
