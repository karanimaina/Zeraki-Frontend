import { NgModule } from "@angular/core";

import { ClassesRoutingModule } from "./classes-routing.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import * as classes from "./index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatNativeDateModule } from "@angular/material/core";
import { AttendanceReportComponent } from "./index";


@NgModule({
	declarations: [
		classes.ClassesComponent,
		classes.ManageComponent,
		classes.MyClassesComponent,
		classes.ClassesTopNavComponent,
		classes.StreamsComponent,
		classes.ManageSubjectComponent,
		classes.ManageStreamComponent,
		classes.SubjectCommentsComponent,
		classes.TakeAttendanceComponent,
		classes.AttendanceReportComponent,
		classes.OlevelSubjectsComponent,
		classes.SubjectTopicsComponent,
		classes.TopicCompetenciesComponent,
		classes.NewComponent,
		classes.AddClassSuccessComponent,
		classes.SubjectStudentAdditionComponent
	],
	imports: [
		ClassesRoutingModule,
		SharedModule,
		FormsModule,
		NgSelectModule,
		ReactiveFormsModule,
		MatTooltipModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatFormFieldModule,
	],
	exports: [
		AttendanceReportComponent,
		classes.NewComponent,
	],
	providers: []
})
export class ClassesModule { }
