import { NgModule } from "@angular/core";

import { SelfSignUpRoutingModule } from "./signups-routing.module";
import { SignUpsComponent } from "./signups.component";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		SignUpsComponent,
	],
	imports: [
		SharedModule,
		SelfSignUpRoutingModule
	]
})
export class SignUpsModule { }
