import { NgModule } from "@angular/core";
import { DefaultMatCalendarRangeStrategy, MatDatepickerModule, MAT_DATE_RANGE_SELECTION_STRATEGY } from "@angular/material/datepicker";
import { MatCardModule } from "@angular/material/card";
import { DashboardRoutingModule } from "./dashboard-routing.module";
import { MatNativeDateModule } from "@angular/material/core";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NgSelectModule } from "@ng-select/ng-select";
import { FormsModule } from "@angular/forms";
import { FullCalendarModule } from "@fullcalendar/angular";
import { OwlDateTimeModule, OwlNativeDateTimeModule } from "@danielmoncada/angular-datetime-picker";
import { HighchartsChartModule } from "highcharts-angular";
import { MatSortModule } from "@angular/material/sort";
import { IntakeAttendanceReportComponent } from "./intake-attendance-report/intake-attendance-report.component";
import { TranslateModule } from "@ngx-translate/core";
import { NgScrollbarModule } from "ngx-scrollbar";
import * as dashboard from "./index";
import { OlevelSummaryReportComponent } from "./olevel-summary-report/olevel-summary-report.component";
import { FirstSetupComponent } from "./first-setup/first-setup.component";
import { CarouselModule } from "ngx-owl-carousel-o";


@NgModule({
	declarations: [
		dashboard.DashboardComponent,
		dashboard.GlobalComponent,
		dashboard.MyClassesComponent,
		dashboard.GradClassesComponent,
		dashboard.DashboardTopNavComponent,
		dashboard.WelcomeComponent,
		dashboard.AttendanceReportComponent,
		IntakeAttendanceReportComponent,
		OlevelSummaryReportComponent,
		FirstSetupComponent,
	],
	imports: [
		FormsModule,
		DashboardRoutingModule,
		MatCardModule,
		MatDatepickerModule,
		MatNativeDateModule,
		SharedModule,
		MatFormFieldModule,
		MatInputModule,
		NgScrollbarModule,
		NgSelectModule,
		FullCalendarModule,
		OwlDateTimeModule,
		OwlNativeDateTimeModule,
		TranslateModule,
		HighchartsChartModule,
		MatSortModule,
		CarouselModule,
	],
	providers: [
		{
			provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
			useClass: DefaultMatCalendarRangeStrategy,
		},
	],
	exports: [
		OlevelSummaryReportComponent
	]
})
export class DashboardModule { }
