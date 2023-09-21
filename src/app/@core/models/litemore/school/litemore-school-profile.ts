export interface LitemoreSchoolProfile{
	customer_care_number: number,
	balance: number,
	currency: string,
	school: {
		address: string,
		schoolId: number,
		schoolName: string,
		schoolCode: string,
	},
	registeredProducts: {
		hasAnalytics: boolean
		hasFinance: boolean,
		hasTimeTable: boolean,
	},
	county: string,
	contactPerson: {
		phone: string,
		name: string,
	},
	signUpDate: string,
	relationshipManager: {
		phone: string,
		name: string,
	},
	miniStatement: {
		invoices: number,
		proformaInvoices: number
	},
	usageTracking: {
		setup: string,
		training: string,
	},
	financeUsage: any,
	[x: string]: unknown;
}
