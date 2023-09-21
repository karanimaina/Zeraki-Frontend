export interface UpdateInvoice extends BasePayloadInvoice {
    invoiceId?: number
}

export interface BasePayloadInvoice {
    schoolId: number, 
    grossAmount: number
    dueDate?: any,
    extensionDate?: any; 
    invoiceItems: Array<InvoiceItems>,
}

export interface CreateInvoice extends BasePayloadInvoice {
    proformaInvoiceId?: number
}

interface InvoiceItems {
    itemTypeId: number, 
    grossAmount?: number,
    renewal?: {
        grossAmount: number
    },
    setup?: {
        grossAmount: number,
    }
}