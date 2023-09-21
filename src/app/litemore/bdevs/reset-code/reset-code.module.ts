import { NgModule } from "@angular/core";

import { ResetCodeRoutingModule } from "./reset-code-routing.module";
import { ResetCodeComponent } from "./reset-code.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [
		ResetCodeComponent
	],
	imports: [
		ResetCodeRoutingModule,
		NgSelectModule,
		SharedModule
	]
})
export class ResetCodeModule { }
