import { NgModule } from "@angular/core";
import { CommonModule, CurrencyPipe } from "@angular/common";
import * as pipes from "./index";



@NgModule({
	declarations: [
		pipes.CamelCaseToWordPipe,
		pipes.LocalCurrencyPipe,
		pipes.SafeText,
		pipes.SafePipe,
		pipes.NumberPipe,
		pipes.TermNamePipe,
		pipes.VoteHeadNamePipe,
		pipes.GroupNamePipe,
		pipes.IntakesPipe,
		pipes.StreamsPipe,
		pipes.SplitNavTextPipe,
		pipes.FormOrYearPipe,
		pipes.SchoolTypePipe,
		pipes.SchoolTypeWithParamsPipe,
		pipes.NumberToWordsPipe,
		pipes.TemporaryTranslationsPipe,
		pipes.TemporaryArrayTranslationsPipe,
		pipes.translateSubjectValuePipe,
		pipes.PaginatedListIndexPipe,
		pipes.PapersPipe,
		pipes.SchoolTitlePipe,
		pipes.NormalizeTextPipe
	],
	imports: [
		CommonModule
	],
	exports: [
		pipes.CamelCaseToWordPipe,
		pipes.LocalCurrencyPipe,
		pipes.SafeText,
		pipes.SafePipe,
		pipes.NumberPipe,
		pipes.TermNamePipe,
		pipes.VoteHeadNamePipe,
		pipes.GroupNamePipe,
		pipes.IntakesPipe,
		pipes.StreamsPipe,
		pipes.SplitNavTextPipe,
		pipes.FormOrYearPipe,
		pipes.SchoolTypePipe,
		pipes.SchoolTypeWithParamsPipe,
		pipes.NumberToWordsPipe,
		pipes.TemporaryTranslationsPipe,
		pipes.TemporaryArrayTranslationsPipe,
		pipes.translateSubjectValuePipe,
		pipes.PaginatedListIndexPipe,
		pipes.PapersPipe,
		pipes.SchoolTitlePipe,
		pipes.NormalizeTextPipe
	],
	providers: [
		CurrencyPipe
	]
})
export class PipesModule { }
