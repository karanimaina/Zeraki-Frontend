import { NgModule } from "@angular/core";
import {TranscriptsComponent} from "./transcripts.component";
import {SharedModule} from "../../../../@core/shared/shared.module";
import {RouterModule, Routes} from "@angular/router";
import { OlevelTranscriptsFormComponent } from "./components/olevel-transcripts-form/olevel-transcripts-form.component";
import {OlevelReportsModule} from "../olevel-reports.module";
import { StudentTranscriptComponent } from "./components/student-transcript/student-transcript.component";
import {NgxPrintModule} from "ngx-print";
import { OlevelTranscriptsOptionsComponent } from './components/olevel-transcripts-options/olevel-transcripts-options.component';

const routes: Routes = [
	{
		path: "",
		component: TranscriptsComponent
	}
];


@NgModule({
	declarations: [
		TranscriptsComponent,
		OlevelTranscriptsFormComponent,
		StudentTranscriptComponent,
  OlevelTranscriptsOptionsComponent
	],
	imports: [
		SharedModule,
		RouterModule.forChild(routes),
		OlevelReportsModule,
		NgxPrintModule
	]
})
export class TranscriptsModule { }
