import { NgModule } from "@angular/core";

import { CreateSchoolRoutingModule } from "./create-school-routing.module";
import { CreateSchoolComponent } from "./create-school.component";
import { SharedModule } from "src/app/@core/shared/shared.module";
import {TranslateModule} from "@ngx-translate/core";


@NgModule({
	declarations: [
		CreateSchoolComponent,
	],
	imports: [
		CreateSchoolRoutingModule,
		SharedModule,
		TranslateModule
	]
})
export class CreateSchoolModule { }
