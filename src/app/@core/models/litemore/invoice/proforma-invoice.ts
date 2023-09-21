import {Invoice} from "./invoice";

export interface ProformaInvoice{
	currentPage: number
	invoices: Invoice[]
	itemName: string
	proformaNumber: string
	totalPages: number
	kraPin: string
	vatRate: string
}
