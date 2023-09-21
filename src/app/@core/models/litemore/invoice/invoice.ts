import { BaseInvoice } from "./base-invoice";
import { CompanyInfo } from "./company/company-info";

export interface Invoice extends BaseInvoice {
	invoiceAmount: number,
	itemId: number,
	creditNoteTotal: number,
	balance: number;
	createdBy: string;
	cuSerialNumber?: string;
	cuInvoiceNumber?: string;
	qrCodeUrl: string;
	invoiceItems: Array<InvoiceItems>,
    invoiceCollections: any
}

export interface Invoices {
    kraPin: string,
    itemName: string;
    invoices: Array<Invoice>,
    voteHeads: Array<InvoiceVoteheads>,
    vatRate: string;
    totalPages: number,
    proformaNumber: string;
    proformaId: number;
    currentPage: number;
	companyInfo: CompanyInfo;
}

export interface InvoiceItems {
    creationDate: string;
    dueDate: string;
    daysLeft: string;
    invoiceAmount: number;
    invoiceId: number;
    invoiceNumber: string;
    item: string;
    itemId: number,
    itemTypeId: number,
    netAmount: number,
    grossAmount: number,
    updatedOn: string;
    extenstionDate: string;
    vat: number;
    paymentStatus: boolean
}

interface InvoiceVoteheads {
    typeId: number;
    name: string;
    shortName: string;
    intCode: number;
    amount: number;
}
