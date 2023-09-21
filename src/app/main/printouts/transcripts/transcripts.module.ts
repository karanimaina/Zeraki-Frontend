import { NgModule } from "@angular/core";

import { TranscriptsRoutingModule } from "./transcripts-routing.module";
import { TranscriptsComponent } from "./transcripts.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { FormsModule } from "@angular/forms";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { GradeDescriptorComponent } from "./components";


@NgModule({
	declarations: [
		TranscriptsComponent,
		GradeDescriptorComponent,
	],
	imports: [
		TranscriptsRoutingModule,
		FormsModule,
		NgSelectModule,
		TranslateModule,
		SharedModule
	]
})
export class TranscriptsModule { }
