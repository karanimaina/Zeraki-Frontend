import { NgModule } from "@angular/core";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { MatProgressBarModule } from "@angular/material/progress-bar";

import { StudentsRoutingModule } from "./students-routing.module";
import * as student from "./index";
import { HighchartsChartModule } from "highcharts-angular";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { StudentOlevelProfileComponent } from "./student-olevel-profile/student-olevel-profile.component";
import { StudentAnalyticsSubjectComponent } from "./student-analytics-subject/student-analytics-subject.component";
import { StudentAnalyticsTopNavComponent } from "./student-analytics-top-nav/student-analytics-top-nav.component";
import { FormOrYearPipe } from "../../@core/shared/pipes/form-or-year.pipe";
import { StudentNotesItemsComponent } from "./@components/student-notes-items/student-notes-items.component";
import { StudentsTopNavModule } from "./@components/students-top-nav/students-top-nav.module";
import { OlevelReportFormsModule } from "../printouts/olevels/olevel-report-forms/olevel-report-forms.module";
import { CarouselModule } from "ngx-owl-carousel-o";

@NgModule({
	declarations: [
		student.StudentsComponent,
		student.MoveStudentComponent,
		student.NewStudentComponent,
		student.SearchStudentComponent,
		student.UpdatePhotoComponent,
		student.UpdateProfileComponent,
		student.UploadFeeComponent,
		student.UploadTargetComponent,
		student.StudentProfileComponent,
		student.DisciplineComponent,
		student.StudentActivitiesComponent,
		student.StudentMessagesComponent,
		student.StudentAnalyticsComponent,
		StudentAnalyticsSubjectComponent,
		StudentAnalyticsTopNavComponent,
		StudentOlevelProfileComponent,
		StudentNotesItemsComponent
	],
	imports: [
		StudentsTopNavModule,
		StudentsRoutingModule,
		SharedModule,
		SweetAlert2Module,
		MatProgressBarModule,
		HighchartsChartModule,
		OlevelReportFormsModule,
		CarouselModule
	],
	providers: [FormOrYearPipe],
	exports: [student.NewStudentComponent]
})
export class StudentsModule {}
