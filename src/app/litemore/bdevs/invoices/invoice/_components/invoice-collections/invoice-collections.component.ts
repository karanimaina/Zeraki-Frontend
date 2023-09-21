import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, FormGroup, NgForm } from "@angular/forms";
import { Collection } from "src/app/@core/models/litemore/invoice/collection/collection";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";

@Component({
	selector: "app-invoice-collections",
	templateUrl: "./invoice-collections.component.html",
	styleUrls: ["./invoice-collections.component.scss"]
})
export class InvoiceCollectionsComponent implements OnInit {


    @Input() invoice_collections: any;
    @Input() current_invoice: any;

    @Output() updateCollectionDateEvt: EventEmitter<any> = new EventEmitter();
    @Output() initEditCollectionDateEvt: EventEmitter<any> = new EventEmitter();
    @Output() updateCollectionAdditionalInfoEvt: EventEmitter<any> = new EventEmitter();
    @Output() initEditCollectionAdditionalInfoEvt: EventEmitter<any> = new EventEmitter();
    @Output() initEditCollectionAmountEvt: EventEmitter<any> = new EventEmitter();
    @Output() updateCollectionAmountEvt: EventEmitter<any> = new EventEmitter();
    @Output() initEditCollectionEvt: EventEmitter<any> = new EventEmitter();
    @Output() printCollectionEvt: EventEmitter<any> = new EventEmitter();
    @Output() deleteCollectionEvt: EventEmitter<any> = new EventEmitter();

    invoiceCollections: Collection[] = [];
    editCollectionForm!: FormGroup;

    constructor(
        private bdevService: BdevService,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
    	this.getInvoiceCollections();
    }

    private getInvoiceCollections() {
    	this.bdevService.getInvoiceCollections(this.current_invoice.invoiceId).subscribe(({ collections }) => {
    		this.invoiceCollections = collections;
    		this.initializeEditCollectionForm();
    	});
    }

    private initializeEditCollectionForm() {
    	this.editCollectionForm = this.fb.group({
    		collections: this.invoiceCollections.map(collection => this.fb.group({
    			collectionid: collection.collectionId,
    			amount: collection.amount,
    			date: collection.collectionDate,
    			additional_info: collection.additionalInfo
    		}))
    	});

    	console.log(this.editCollectionForm);
    }

    updateCollectionDate(form: NgForm, collection: any) {
    	if (form.invalid) {
    		return;
    	}
    	this.updateCollectionDateEvt.emit(collection);
    }

    initEditCollectionDate(collection: any) {
    	this.initEditCollectionDateEvt.emit(collection);
    }

    updateCollectionAdditionalInfo(collection: any) {
    	this.updateCollectionAdditionalInfoEvt.emit(collection);
    }

    initEditCollectionAdditionalInfo(collection: any) {
    	this.initEditCollectionAdditionalInfoEvt.emit(collection);
    }

    initEditCollectionAmount(collection: any) {
    	this.initEditCollectionAmountEvt.emit(collection);
    }

    updateCollectionAmount(form: NgForm, collection: any) {
    	if (form.invalid) {
    		return;
    	}
    	this.updateCollectionAmountEvt.emit(collection);
    }

    initEditCollection(collection: any, status: boolean) {
    	this.initEditCollectionEvt.emit({ collection: collection, status: status });
    }

    printCollection(collection: any) {
    	this.printCollectionEvt.emit(collection);
    }
    deleteCollection(collection: any) {
    	this.deleteCollectionEvt.emit(collection);
    }
}
