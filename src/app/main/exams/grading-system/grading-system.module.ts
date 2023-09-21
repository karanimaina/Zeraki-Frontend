import { NgModule } from "@angular/core";

import { GradingSystemRoutingModule } from "./grading-system-routing.module";
import { GradingSystemComponent } from "./grading-system.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { GradingSystemAdditionComponent, GradingSystemDetailsComponent, GradingSystemListComponent } from "./components";


@NgModule({
	declarations: [
		GradingSystemComponent,
		GradingSystemAdditionComponent,
		GradingSystemListComponent,
		GradingSystemDetailsComponent,
	],
	imports: [
		GradingSystemRoutingModule,
		SharedModule
	]
})
export class GradingSystemModule { }
