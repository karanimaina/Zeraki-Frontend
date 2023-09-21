import { NgModule } from "@angular/core";

import { MyClassesRoutingModule } from "./my-classes-routing.module";
import { TranslateModule } from "@ngx-translate/core";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { UploadExamsSubjectComponent } from "./upload-exams-subject/upload-exams-subject.component";
import { MyClassesComponent } from "./my-classes/my-classes.component";


@NgModule({
	declarations: [
		MyClassesComponent,
		UploadExamsSubjectComponent
	],
	imports: [
		MyClassesRoutingModule,
		TranslateModule,
		SharedModule,
	],
	exports: [
		UploadExamsSubjectComponent
	]
})
export class ClassesModule { }
