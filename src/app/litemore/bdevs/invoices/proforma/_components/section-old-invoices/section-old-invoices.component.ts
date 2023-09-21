import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import { NgForm } from "@angular/forms";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { OldInvoice } from "src/app/@core/models/litemore/invoice/old-invoice";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { UserInit } from "src/app/@core/models/user_init";

@Component({
	selector: "app-section-old-invoices",
	templateUrl: "./section-old-invoices.component.html",
	styleUrls: ["./section-old-invoices.component.scss"]
})
export class SectionOldInvoicesComponent implements OnInit {

  @Input() schoolInfo!: LitemoreSchoolProfile;
  @Input() userInit!: UserInit;
  @Input() loggedInUser: any;
  @Input() schoolProfomas: any;
  @Input() isCollectOldInvoice: any;
  @Output() isCloseCollectOldInvoice: EventEmitter<any> = new EventEmitter();
  @Output() isupdateOldInvoiceDate: EventEmitter<any> = new EventEmitter();
  @Output() isupdateOldInvoiceAmount: EventEmitter<any> = new EventEmitter();
  @Output() isInitEditExtensionDate: EventEmitter<any> = new EventEmitter();
  @Output() isInitEditGrossAmount: EventEmitter<any> = new EventEmitter();
  @Output() isMakeCollectionOldInvoice: EventEmitter<any> = new EventEmitter();
  @Output() isShowOldInvoicePrint: EventEmitter<any> = new EventEmitter();
  @Output() isEditOldInvoice: EventEmitter<any> = new EventEmitter();
  @Output() isShowUpdateInvoice: EventEmitter<any> = new EventEmitter();
  @Output() isProfomaPrevClicked: EventEmitter<any> = new EventEmitter();
  @Output() isProfomaNextClicked: EventEmitter<any> = new EventEmitter();
  @Output() isRecordCollection: EventEmitter<any> = new EventEmitter();

  selectedInvoice!: OldInvoice;
  readonly LitemoreUserRole = LitemoreUserRole;

  constructor() { }

  ngOnInit(): void { }

  closeCollectOldInvoice() {
  	this.isCloseCollectOldInvoice.emit();
  }

  updateOldInvoiceDate(form: NgForm, invoice: any) {
  	if (form.invalid) {
  		return;
  	}
  	this.isupdateOldInvoiceDate.emit(invoice);
  }

  updateOldInvoiceAmount(form: NgForm, invoice: any) {
  	if (form.invalid) return;

  	this.isupdateOldInvoiceAmount.emit(invoice);
  }

  initEditExtensionDate(invoice: any, status: boolean) {
  	const obj = {
  		invoice: invoice,
  		status: status
  	};
  	this.isInitEditExtensionDate.emit(obj);
  }

  initEditInvoiceAmount(invoice: any, status: boolean) {
  	this.isInitEditGrossAmount.emit({ invoice, status });
  }

  makeCollectionOldInvoice(invoice: any) {
    this.selectedInvoice = invoice;
  	this.isMakeCollectionOldInvoice.emit(invoice);
  }

  showOldInvoicePrint(invoice: any) {
  	this.isShowOldInvoicePrint.emit(invoice);
  }

  editOldInvoice(invoice: any, status: boolean) {
  	const obj = {
  		invoice: invoice,
  		status: status
  	};
  	this.isEditOldInvoice.emit(obj);
  }

  showUpdateInvoice(invoice: any) {
  	this.isShowUpdateInvoice.emit(invoice);
  }

  profomaPrevClicked() {
  	this.isProfomaPrevClicked.emit();
  }
  profomaNextClicked() {
  	this.isProfomaNextClicked.emit();
  }

  recordCollection(form: NgForm) {
  	if (form.invalid) {
  		return;
  	}
  	this.isRecordCollection.emit(form.value);
  }

}
