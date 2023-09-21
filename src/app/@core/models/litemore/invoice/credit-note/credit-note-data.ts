import {CreditNote} from "./credit-note";

export interface CreditNoteData{
    creditNotes: CreditNote[]
    kraPin: string
    vatRate: string
}