import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";


@Component({
	selector: "app-section-proforma-invoices",
	templateUrl: "./section-proforma-invoices.component.html",
	styleUrls: ["./section-proforma-invoices.component.scss"]
})
export class SectionProformaInvoicesComponent implements OnInit {

	@Input() schoolProfomas: any;
	@Input() isUpdatingProformaInvoice!: boolean;
	@Input() isUpdatingProformaExtensionDate!: boolean;
	@Output() isShowCreateInvoice: EventEmitter<any> = new EventEmitter();
	@Output() isInitiateProformaInvoiceExtensionDate: EventEmitter<any> = new EventEmitter();
	@Output() isInitProformaEdit: EventEmitter<any> = new EventEmitter();
	@Output() isSendReminder: EventEmitter<any> = new EventEmitter();
	@Output() isViewInvoices: EventEmitter<any> = new EventEmitter();
	@Output() isShowProformaPrint: EventEmitter<any> = new EventEmitter();
	@Output() isDeleteProforma: EventEmitter<any> = new EventEmitter();
	@Output() isUpdateProformaExtensionDate: EventEmitter<any> = new EventEmitter();
	@Output() isInitProformaInvoiceAmountEdit: EventEmitter<any> = new EventEmitter();
	@Output() isUpdateProformaInvoiceAmount: EventEmitter<any> = new EventEmitter();
	@Output() isProfomaPrevClicked: EventEmitter<any> = new EventEmitter();
	@Output() isProfomaNextClicked: EventEmitter<any> = new EventEmitter();
	@Output() isUpdateProforma: EventEmitter<any> = new EventEmitter();

	constructor() { }

	ngOnInit(): void { }

	showCreateInvoice() {
		this.isShowCreateInvoice.emit();
	}

	initiateProformaInvoiceExtensionDate(proformaInvoice: any) {
		this.isInitiateProformaInvoiceExtensionDate.emit(proformaInvoice);
	}

	initiateProformaEdit(proforma: any, status: any) {
		const obj: any = {
			proforma: proforma,
			status: status
		};
		this.isInitProformaEdit.emit(obj);
	}

	sendReminder(proformaItem: any) {
		this.isSendReminder.emit(proformaItem);
	}

	showUpdateProforma(proformaInvoice: any) { 
		this.isUpdateProforma.emit(proformaInvoice);
	}

	viewInvoices(proformaItemId: any, proformaNumber: any, status: any) {
		const obj: any = {
			proformaItemId: proformaItemId,
			proformaNumber: proformaNumber,
			isProformaInvoice: status
		};
		this.isViewInvoices.emit(obj);
	}

	showProformaPrint(profoma: any) {
		this.isShowProformaPrint.emit(profoma);
	}
	deleteProformaInvoice(proforma: any) {
		this.isDeleteProforma.emit(proforma);
	}

	profomaPrevClicked() {
		this.isProfomaPrevClicked.emit();
	}
	profomaNextClicked() {
		this.isProfomaNextClicked.emit();
	}
}

