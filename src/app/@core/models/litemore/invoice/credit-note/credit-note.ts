export interface CreditNote {
	creditNoteDescription: string | null;
	creditNoteDescriptionId: number | null;
	creditNoteItems: Array<CreditNoteItem>;
}

export interface CreditNoteItem {
	creditNoteId: number;
	creditNoteNumber: string;
	createdOn: number;
	currency: string;
	netAmount: number;
	vatAmount: number;
	grossAmount: number;
	invoiceId: number;
	invoiceBalance: number;
	invoiceNumber: string;
	item: string;
	creditNoteDescription: string;
	cuSerialNumber?: string;
	cuInvoiceNumber?: string;
	qrCodeUrl?: string;
}
