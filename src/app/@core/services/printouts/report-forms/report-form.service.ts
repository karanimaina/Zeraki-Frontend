import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../../../environments/environment";
import { ReportForms } from "../../../models/printouts/report-forms/report-forms";
import { map } from "rxjs/operators";
import { ReportFormMapping } from "../../../models/printouts/report-forms/report-form-mapping";
import { Observable } from "rxjs";
import * as pdfMake from "pdfmake/build/pdfmake";

@Injectable({
	providedIn: "root"
})
export class ReportFormService {
	API_URL = environment.apiurl;
	constructor(private httpClient: HttpClient) { }

	getReportForms(params) {
		return this.httpClient.get<ReportForms>(`${this.API_URL}/analytics/student/${params}`)
			.pipe(
				map(data => new ReportFormMapping(data).getReportForms())
			);
	}

	downloadReportAsPdf$(pdfDocument: any, fileName: string): Observable<any> {
		return new Observable((observer) => {
			if (typeof Worker !== "undefined") {

				const worker = new Worker(new URL("../../../../@core/workers/reports.worker", import.meta.url));
				worker.postMessage(JSON.stringify(pdfDocument));
				worker.onmessage = ({ data }) => {

					const fileURL: any = URL.createObjectURL(data.pdfBlob);
					const a = document.createElement("a");
					a.href = fileURL;
					a.target = "_blank";
					a.download = fileName + ".pdf";
					document.body.appendChild(a);
					a.click();

					observer.next();
					observer.complete();
				};

				worker.onerror = (error) => {
					observer.error(error);
				};
			} else {
				pdfMake.createPdf(pdfDocument).download(fileName + ".pdf", () => {
					observer.next();
				});
			}
		});
	}
}
