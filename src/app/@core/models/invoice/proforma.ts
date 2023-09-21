export interface CreateProforma {
    proformaId?: number
    schoolId: number,
    dueDate?: any,
    proformaItems: Array<ProformaItems>,
    setupDueDate?: any,
    extensionDate?: any;
    hasOptions: boolean
}

interface ProformaItems {
    itemTypeId: number,
    grossAmount?: number,
    renewal?: {
        grossAmount: number
    },
    setup?: {
        grossAmount: number,
    }
}
