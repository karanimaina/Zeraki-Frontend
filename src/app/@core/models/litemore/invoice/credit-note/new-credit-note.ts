export interface NewCreditNote {
	creditNoteDescription: string;
	creditNoteItems: Array<{ invoiceItemId: number; grossAmount: number }>;
}
