import { NgModule } from "@angular/core";
import * as exams from "../index";
import { ExamManagementRoutingModule } from "./manage-exam-routing.module";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { FormsModule } from "@angular/forms";
import { ExamsModule } from "../exams.module";
import { ExamCoefficientComponent } from "./exam-coefficient/exam-coefficient.component";

@NgModule({
	declarations: [
		exams.ManageExamComponent,
		exams.UploadExamsComponent,
		exams.EditExamComponent,
		exams.EditTopNavComponent,
		exams.AddIntakeComponent,
		exams.ExamsListComponent,
		ExamCoefficientComponent,
	],
	imports: [
		ExamManagementRoutingModule,
		FormsModule,
		SharedModule,
		ExamsModule
	]
})
export class ExamManagementModule { }
