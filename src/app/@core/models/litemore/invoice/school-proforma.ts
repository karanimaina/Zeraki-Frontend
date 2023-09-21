import {Invoice} from "./invoice";

export interface SchoolProforma {
	balance: number
	contactPerson: ContactPerson
	currentPage: number
	miniStatement: MiniStatement
	oldInvoices: []
	proformaInvoices: Invoice[]
	school: School
	totalPages: number
}

interface ContactPerson{
	name: string
	phone: string
}

interface MiniStatement{
	invoices : number,
	proformaInvoices: number
}

interface School{
	schoolCode: string
	schoolId: number
	schoolName: string
}
