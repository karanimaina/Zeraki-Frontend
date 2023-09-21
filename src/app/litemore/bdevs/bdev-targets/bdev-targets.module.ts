import { NgModule } from "@angular/core";

import { BdevTargetsRoutingModule } from "./bdev-targets-routing.module";
import { BdevTargetsComponent } from "./bdev-targets.component";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/@core/shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";


@NgModule({
	declarations: [
		BdevTargetsComponent
	],
	imports: [
		BdevTargetsRoutingModule,
		FormsModule,
		SharedModule,
		TranslateModule
	]
})
export class BdevTargetsModule { }
