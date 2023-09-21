import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InputComponent } from "./input/input.component";
import { ReactiveFormsModule } from "@angular/forms";
import { InputErrorMessageComponent } from "./input-error-message/input-error-message.component";
import { NgSelectComponent } from "./ng-select/ng-select.component";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { TextareaComponent } from "./textarea/textarea.component";
import { ExcelDownloadTemplateComponent } from "./excel-download-template/excel-download-template.component";
import { PaginationComponent } from "./pagination/pagination.component";
import {RouterModule} from "@angular/router";
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { ScreenSizeDetectorComponent } from "./screen-size-detector/screen-size-detector.component";
import { CheckboxComponent } from "./checkbox/checkbox.component";



@NgModule({
	declarations: [
		InputComponent,
		InputErrorMessageComponent,
		NgSelectComponent,
		TextareaComponent,
		ExcelDownloadTemplateComponent,
		PaginationComponent,
		NavBarComponent,
		ScreenSizeDetectorComponent,
		CheckboxComponent
	],
	exports: [
		InputComponent,
		NgSelectComponent,
		TextareaComponent,
		ExcelDownloadTemplateComponent,
		PaginationComponent,
		NavBarComponent,
		ScreenSizeDetectorComponent,
		CheckboxComponent
	],
	imports: [
		CommonModule,
		ReactiveFormsModule,
		NgSelectModule,
		TranslateModule,
		RouterModule
	]
})
export class UiComponentsModule { }
