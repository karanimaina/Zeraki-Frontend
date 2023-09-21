import { NgModule } from "@angular/core";
import { EducationSystemsRoutingModule } from "./education-systems-routing.module";
import { EducationSystemsListComponent, EducationSystemsComponent, EducationSystemUpdateModalComponent } from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";

@NgModule({
	declarations: [
		EducationSystemsListComponent,
		EducationSystemsComponent,
		EducationSystemUpdateModalComponent
	],
	imports: [
		SharedModule,
		EducationSystemsRoutingModule,
	]
})
export class EducationSystemsModule { }
