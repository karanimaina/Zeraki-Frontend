import { NgModule } from "@angular/core";
import { CurrencyPipe } from "@angular/common";

import { StudentRoutingModule } from "./student-routing.module";
import * as components from "../index";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { NgxPrintModule } from "ngx-print";



@NgModule({
	declarations: [
		components.StudentComponent,
		components.CreateMicroPaymentComponent,
		components.ProgressMicropaymentComponent,
		components.StageOneComponent,
		components.StageTwoComponent,
		components.StageThreeComponent,
		components.AddPaymentDetailsComponent,
		components.StudentBalanceComponent,
		components.StudentDashboardComponent,
		components.SearchStudentComponent,
		components.MakePaymentComponent,
		components.SvgCollectionComponent,
		components.FinanceTopNavComponent,
		components.StudentStatementComponent,
		components.StudentCollectionComponent,
		components.StudentMicroPaymentsComponent,
		components.PaymentConfirmationComponent,
		components.CollectionReceiptComponent,
		components.WatermarkComponent
	],
	imports: [
		StudentRoutingModule,
		SharedModule,
		NgSelectModule,
		TranslateModule,
		NgxPrintModule,
	],
	exports: [
		components.SearchStudentComponent,
		components.StudentBalanceComponent,
		components.SvgCollectionComponent,
		components.FinanceTopNavComponent,
		components.AddPaymentDetailsComponent,
	],
	providers:[ CurrencyPipe ]
})
export class StudentModule { }
