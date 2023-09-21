export interface CollectionPayload {
    invoiceId: number, 
    schoolId: string, 
    amount: number, 
    additionalInfo: string, 
    collectionDate: number, 
    useSchoolBalance?: boolean
}