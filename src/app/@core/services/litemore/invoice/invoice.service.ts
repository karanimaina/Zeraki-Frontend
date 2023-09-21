import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { environment } from "../../../../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { take } from "rxjs/operators";
import { NewCreditNote } from "../../../models/litemore/invoice/credit-note/new-credit-note";
import { CreditNoteData } from "../../../models/litemore/invoice/credit-note/credit-note-data";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { Invoices } from "src/app/@core/models/litemore/invoice/invoice";
import { CollectionPayload } from "src/app/litemore/bdevs/invoices/models/colecction";
import { InvoiceUpdatePayload } from "src/app/litemore/bdevs/invoices/models/invoice-update";

export interface Votehead {
	name: string;
	typeId: number;
	shortName: string;
}

@Injectable({
	providedIn: "root"
})
export class InvoiceService {
	private invoices: ReplaySubject<Invoices> = new ReplaySubject();
	private voteHeadsSubject: Subject<Array<Votehead>> = new ReplaySubject<
		Array<Votehead>
	>();
	private apiUrl = environment.apiurl;

	constructor(
		private http: HttpClient,
		private responseHandler: ResponseHandlerService
	) {}

	clearCache() {
		this.invoices.next(null!);
	}

	getInvoicesFromProforma() {
		return this.invoices.asObservable();
	}

	getProformaInvoices(
		schoolId: number,
		proformaId: number,
		isProformaInvoice: boolean,
		params: any
	): Observable<any> {
		const url = `${environment.apiurl}/invoice/proforma/${schoolId}/${proformaId}${params}&isProformaInvoice=${isProformaInvoice}`;
		return this.http.get(url);
	}

	setInvoices(invoices: Invoices) {
		this.invoices.next(invoices);
	}

	setInvoicesFromProforma(
		schoolId: number,
		proformaId: number,
		isProformaInvoice: boolean,
		params: any
	) {
		this.getProformaInvoices(
			schoolId,
			proformaId,
			isProformaInvoice,
			params
		).subscribe((invoices) => {
			this.setInvoices(invoices);
		});
	}

	getCreditNotesData(invoiceId) {
		return this.http.get<CreditNoteData>(
			`${environment.apiurl}/creditNote?invoiceId=${invoiceId}`
		);
	}

	createCreditNote(creditNote: NewCreditNote) {
		return this.http.post(`${environment.apiurl}/creditNote`, creditNote);
	}

	updateCreditNote(updatedCreditNote: any) {
		return this.http.put(`${environment.apiurl}/creditNote`, updatedCreditNote);
	}

	deleteCreditNote(creditNoteId: number) {
		return this.http.delete(
			`${environment.apiurl}/creditNote?creditNoteId=${creditNoteId}`
		);
	}

	getInvoiceVoteHeads(): Observable<Votehead[]> {
		return this.voteHeadsSubject.asObservable();
	}

	setInvoiceVoteHeads(voteHeads?: Votehead[]) {
		if (voteHeads) {
			this.voteHeadsSubject.next(voteHeads);
		} else {
			this.http
				.get<Votehead[]>(`${environment.apiurl}/invoice/itemTypes`)
				.pipe(take(1))
				.subscribe({
					next: (resp) => {
						this.voteHeadsSubject.next(resp);
					},
					error: (err) => {
						this.responseHandler.error(err, "setInvoiceVoteHeads()");
					}
				});
		}
	}

	createProformaInvoice(proforma: any, isUpdate = false): Observable<any> {
		if (isUpdate) {
			return this.http.put(`${environment.apiurl}/invoice/proforma`, proforma);
		}
		return this.http.post(`${environment.apiurl}/invoice/proforma`, proforma);
	}

	createInvoice(invoice: any, isUpdate = false): Observable<any> {
		if (isUpdate)
			return this.http.put(
				`${environment.apiurl}/invoice/proforma/invoice`,
				invoice
			);
		return this.http.post(
			`${environment.apiurl}/invoice/proforma/invoice`,
			invoice
		);
	}

	getSchoolProformas(schoolId: number, params: any): Observable<any> {
		return this.http.get(
			`${environment.apiurl}/invoice/proforma/${schoolId}?${params}`
		);
	}

	getInvoiceById(invoiceId: number) {
		return this.http.get(`${environment.apiurl}/groups/invoice/${invoiceId}`);
	}

	getProformaInvoiceById(proformaInvoiceId: number) {
		return this.http.get<any>(
			`${environment.apiurl}/groups/proforma/${proformaInvoiceId}`
		);
	}

	addCollection(collectionPayload: CollectionPayload) {
		return this.http.post(
			`${this.apiUrl}/invoice/collection`,
			collectionPayload
		);
	}

	updateInvoice(payload: InvoiceUpdatePayload) {
		return this.http.put(
			`${this.apiUrl}/groups/invoice/update`,
			payload
		);
	}
}
