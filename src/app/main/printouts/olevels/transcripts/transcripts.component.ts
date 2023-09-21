import {ChangeDetectionStrategy, Component, OnInit} from "@angular/core";
import {OlevelTranscriptsService} from "./services/olevel-transcripts.service";
import {Observable, of} from "rxjs";
import {catchError, map} from "rxjs/operators";
import {SchoolService} from "../../../../@core/shared/services/school/school.service";
import {DataService} from "../../../../@core/shared/services/data/data.service";
import {ResponseHandlerService} from "../../../../@core/shared/services/response-handler/response-handler.service";
import {OlevelTranscript, termName} from "./models/olevel-transcript";

@Component({
	selector: "app-olevel-transcripts",
	templateUrl: "./transcripts.component.html",
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TranscriptsComponent implements OnInit {
	olevelTranscript$!: Observable<OlevelTranscript>;
	grades;
	loadingTranscripts = false;
	constructor(
		private transcriptsService: OlevelTranscriptsService,
		private dataService: DataService,
		private schoolService: SchoolService,
		private responseHandler: ResponseHandlerService) {
	}

	ngOnInit(): void {

	}

	fetchTranscripts(formValues: any) {
		this.loadingTranscripts = true;
		this.olevelTranscript$ = this.transcriptsService.getTranscripts(formValues)
			.pipe(
				map((data: any) => {
					this.loadingTranscripts = false;
					data.term = termName(JSON.parse(formValues.yearSummaryTerms) || []);
					return data;
				}),
				catchError((error) => {
					this.loadingTranscripts = false;
					this.responseHandler.error(error, "fetchTranscripts()");

					return of(null!);
				})
			);
	}
}
