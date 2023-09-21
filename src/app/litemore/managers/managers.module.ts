import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { ManagersRoutingModule } from "./managers-routing.module";
import { ManagersComponent } from "./managers.component";


@NgModule({
	declarations: [
		ManagersComponent
	],
	imports: [
		CommonModule,
		ManagersRoutingModule,
	]
})
export class ManagersModule { }
