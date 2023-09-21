export interface RetrieveFormMappingFilters {
	currentPage?: number;
	educationSystemId?: number;
	download?: boolean;
	formValue?: string;
}

export interface AddFormMappingPayload {
	educationSystemId: string;
	formMappings: Array<{ formKey: number; formValue: string; }>
}

export interface UpdateFormMappingPayload extends AddFormMappingPayload {
	formMappings: Array<{ formMappingId: number; formKey: number; formValue: string; }>
}
