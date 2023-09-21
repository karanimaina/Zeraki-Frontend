export interface RetrieveEducationSystemFilters {
	currentPage?: number;
	countryId?: number;
	download?: boolean;
	name?: string;
}

export interface AddEducationSystemPayload {
	countryId: number;
	name: string;
	code: string;
	classType: string;
	maxClassNumber: number;
}

export type UpdateEducationSystemPayload = Omit<AddEducationSystemPayload, "countryId"> & { educationSystemId: number }
