import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import * as shared from "../../index";
import { LoaderDivModule } from "../loader-div/loader-div.module";
import { PipesModule } from "../../pipes/pipes.module";



@NgModule({
	declarations: [
		shared.SchoolMetricsComponent,
	],
	imports: [
		CommonModule,
		LoaderDivModule,
		PipesModule,
	],
	exports: [
		shared.SchoolMetricsComponent,
	]
})
export class SchoolMetricsModule { }
