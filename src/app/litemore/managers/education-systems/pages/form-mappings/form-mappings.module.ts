import { NgModule } from "@angular/core";

import { FormMappingsRoutingModule } from "./form-mappings-routing.module";
import { SharedModule } from "src/app/@core/shared/shared.module";
import * as components from "../../index";


@NgModule({
	declarations: [
		components.FormMappingsComponent,
		components.FormMappingsListComponent,
		components.FormMappingAdditionComponent,
	],
	imports: [
		SharedModule,
		FormMappingsRoutingModule
	]
})
export class FormMappingsModule { }
