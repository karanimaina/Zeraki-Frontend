import { Component, OnInit} from "@angular/core";
import {Observable, of} from "rxjs";
import {catchError, finalize, map, tap} from "rxjs/operators";
import {OlevelMeritListService} from "./services/olevel-merit-list.service";
import {OlevelMeritList} from "./models/olevel-merit-list";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import {TranslateService} from "@ngx-translate/core";
import {DataService} from "../../../../@core/shared/services/data/data.service";
import {OlevelMeritListPdf} from "./services/olevel-merit-list-pdf";
import {SchoolService} from "../../../../@core/shared/services/school/school.service";
import {imageFromDomToBase64} from "../../../../@core/shared/utilities/image-to-base64";
import {PdfParams} from "./models/pdf-params";

@Component({
	selector: "app-olevel-merit-list",
	templateUrl: "./olevel-merit-list.component.html",
	styleUrls: ["./olevel-merit-list.component.scss"]
})
export class OlevelMeritListComponent implements OnInit {
	meritList$!: Observable<OlevelMeritList>;
	formOrYear$: Observable<string> = this.dataService.schoolData.pipe(map((schoolData) => schoolData.formoryear));
	meritListTitle = "";
	classLevel = "";

	fetchingMeritList!: boolean;
	objectKeys = Object.keys;

	selectedOptions: any = {};
	assessmentColumnLabelsDefault: string[] = [];
	assessmentColumnLabelsFinal: string[] = [];
	downloadingMeritList!: boolean;

	constructor(
		private olevelMeritListService: OlevelMeritListService,
		private translate: TranslateService,
		private dataService: DataService,
		private responseHandler: ResponseHandlerService,
		private olevelMeritListPdf: OlevelMeritListPdf,
		private schoolService: SchoolService) {
	}

	ngOnInit(): void {
	}

	fetchMeritList(formValues: any) {
		this.fetchingMeritList = true;
		this.meritList$ = this.olevelMeritListService
			.getMeritList(formValues)
			.pipe(
				tap((meritList) => {
					this.meritListTitle = `${this.translate.instant("common.term")} ${meritList.term} ${meritList.academicYear}`;
					this.classLevel = meritList.classLevel + " " + (meritList.stream || "");

					const labels = meritList.assessmentColumnLabels || [];
					this.assessmentColumnLabelsDefault = [...labels];
				}),
				catchError(err => {
					this.responseHandler.error(err, "fetchMeritList()");
					return of(null!);
				}),
				finalize(() => {
					this.fetchingMeritList = false;
				})
			);
	}

	updateSelectedOptions(selectedOptions: { showProjects: boolean, showExams: boolean }) {
		this.selectedOptions = selectedOptions;

		const assessmentColumnLabelsCopy = [...this.assessmentColumnLabelsDefault];
		this.assessmentColumnLabelsFinal = [...assessmentColumnLabelsCopy];

		if (selectedOptions.showExams && selectedOptions.showProjects) {
			this.assessmentColumnLabelsFinal = [...this.assessmentColumnLabelsDefault];
			return;
		}

		if (!selectedOptions.showExams && selectedOptions.showProjects) {
			assessmentColumnLabelsCopy.pop();
			this.assessmentColumnLabelsFinal = [...assessmentColumnLabelsCopy];
			return;
		}

		if (selectedOptions.showExams && !selectedOptions.showProjects) {
			assessmentColumnLabelsCopy.splice(1, 1);
			this.assessmentColumnLabelsFinal = [...assessmentColumnLabelsCopy];
			return;
		}

		assessmentColumnLabelsCopy.splice(1, 2);
		this.assessmentColumnLabelsFinal = [...assessmentColumnLabelsCopy];
	}

	downloadMeritListPdf(meritList: OlevelMeritList) {
		this.schoolService.schoolInfo.subscribe((schoolInfo) => {
			console.log(schoolInfo);
		});

		const pdfParams: PdfParams = {
			meritList,
			schoolLogo: this.schoolLogo,
			classLevel: this.classLevel,
			assessmentColumnLabels: this.assessmentColumnLabelsFinal,
			meritListTitle: this.translate.instant("printouts.meritList.title") + " -" +this.meritListTitle,
		};

		this.downloadingMeritList = true;
		this.olevelMeritListPdf.generatePdf(pdfParams).subscribe(() => {
			this.downloadingMeritList = false;
		}, () => {
			this.downloadingMeritList = false;
		});
	}

	get schoolLogo() {
		const schoolLogoElement = document.getElementById("school-logo");
		return imageFromDomToBase64(schoolLogoElement);
	}
}
