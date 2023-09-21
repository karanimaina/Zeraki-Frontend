import { NgModule } from "@angular/core";
import { ZlCredentialsRoutingModule } from "./zl-credentials-routing.module";
import * as zlCredentials from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		zlCredentials.ZlCredentialsComponent
	],
	imports: [
		SharedModule,
		ZlCredentialsRoutingModule
	]
})
export class ZlCredentialsModule { }
