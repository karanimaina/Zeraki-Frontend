import { NgModule } from "@angular/core";
import { PrintoutsRoutingModule } from "./printouts-routing.module";
import * as printouts from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";

@NgModule({
	declarations: [
		printouts.PrintoutsComponent,
		printouts.PrintTopNavComponent,
	],
	imports: [
		PrintoutsRoutingModule,
		SharedModule
	]
})
export class PrintoutsModule { }

