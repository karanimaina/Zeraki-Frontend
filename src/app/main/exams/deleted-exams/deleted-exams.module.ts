import { NgModule } from "@angular/core";

import { DeletedExamsRoutingModule } from "./deleted-exams-routing.module";
import { DeletedExamsComponent } from "../index";
import { SharedModule } from "src/app/@core/shared/shared.module";


@NgModule({
	declarations: [DeletedExamsComponent],
	imports: [
		DeletedExamsRoutingModule,
		SharedModule
	]
})
export class DeletedExamsModule { }
