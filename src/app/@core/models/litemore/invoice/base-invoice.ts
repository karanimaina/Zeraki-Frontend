export interface BaseInvoice{
	amountCollected: number
	amountRemaining: number
	creationDate: string
	daysLeft: number
	dueDate: string
	extensionDate: string
	item: string
	netAmount: number
	paymentStatus: boolean
	updatedOn: string
	updatedBy: string
	vat: number
	vatRate: string
	kraPin: string
	grossAmount: number;
    invoiceId: number;
    invoiceNumber: string;
}
