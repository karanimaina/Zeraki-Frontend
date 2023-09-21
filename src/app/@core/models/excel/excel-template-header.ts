export interface ExcelTemplateHeader{
	key: string,
	value: string,
	width?: number,
	displayValue?: string,
	type?: "marks",
	meaning?: string;
	translate?: boolean;
	originalKey?:string;
}
