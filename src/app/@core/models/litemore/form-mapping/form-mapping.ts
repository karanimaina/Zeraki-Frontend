export interface FormMapping {
	educationSystemId: number;
	name: string;
	classType: string;
	formMappings: Array<FormMappingItem>;
}

export interface FormMappingItem {
	formMappingId: number;
	formKey: number;
	formValue: string;
}
