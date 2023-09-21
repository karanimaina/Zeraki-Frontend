import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TranslateModule } from "@ngx-translate/core";
import { NgSelectModule } from "@ng-select/ng-select";
import * as shared from "./index";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { NgxPrintModule } from "ngx-print";
import { UiComponentsModule } from "./ui-components/ui-components.module";
import { CountryViewsModule } from "./ui-components/countries/country-views.module";
import { LoaderDivModule } from "./components/loader-div/loader-div.module";
import { PipesModule } from "./pipes/pipes.module";
import { PdfViewerModule } from "ng2-pdf-viewer";


@NgModule({
	declarations: [
		// COMPONENTS
		shared.FeedbackComponent,
		shared.ConnectionLostComponent,
		shared.WhatsappDialogComponent,
		shared.TelDialogComponent,
		shared.LoaderPulseComponent,
		shared.ReceiptHeaderComponent,
		shared.NoDataRefreshComponent,
		shared.LetterHeadComponent,
		shared.SplashComponent,
		shared.SubmitFormComponent,
		shared.FieldErrorsComponent,
		shared.LitemoreListPaginationComponent,
		shared.ClassListComponent,
		shared.StudentsHouseListComponent,

		// DIRECTIVES
		shared.GradeValidatorDirective,
		shared.ImageValidatorDirective,
		shared.EmptyStringValidatorDirective,
		shared.GradeValidatorDirective,
		shared.ImageValidatorDirective,
		shared.GradeValidatorDirective,
		shared.PhoneValidatorDirective,
		shared.MarkAllTouchedDirective,
		shared.LitemoreUserAccessDirective,
		shared.NormalTeacherHiddenDirective
	],
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		NgSelectModule,
		TranslateModule,
		SweetAlert2Module,
		NgxPrintModule,
		LoaderDivModule,
		PipesModule,
		PdfViewerModule,
		UiComponentsModule,
		CountryViewsModule,
	],
	exports: [
		// MODULES
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		TranslateModule,
		NgSelectModule,
		SweetAlert2Module,
		UiComponentsModule,
		CountryViewsModule,
		LoaderDivModule,
		PipesModule,
		PdfViewerModule,

		// COMPONENTS
		shared.FeedbackComponent,
		shared.ConnectionLostComponent,
		shared.WhatsappDialogComponent,
		shared.TelDialogComponent,
		shared.LoaderPulseComponent,
		shared.ReceiptHeaderComponent,
		shared.NoDataRefreshComponent,
		shared.LetterHeadComponent,
		shared.SplashComponent,
		shared.FieldErrorsComponent,
		shared.SubmitFormComponent,
		shared.LitemoreListPaginationComponent,
		shared.ClassListComponent,
		shared.StudentsHouseListComponent,

		// DIRECTIVES
		shared.GradeValidatorDirective,
		shared.ImageValidatorDirective,
		shared.EmptyStringValidatorDirective,
		shared.GradeValidatorDirective,
		shared.ImageValidatorDirective,
		shared.EmptyStringValidatorDirective,
		shared.GradeValidatorDirective,
		shared.PhoneValidatorDirective,
		shared.MarkAllTouchedDirective,
		shared.LitemoreUserAccessDirective,
		shared.NormalTeacherHiddenDirective
	]
})
export class SharedModule {/**/}
