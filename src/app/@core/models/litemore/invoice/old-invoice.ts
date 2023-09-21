import { BaseInvoice } from "./base-invoice";

export interface OldInvoice extends BaseInvoice {
    mainInvoiceItem: string;
}