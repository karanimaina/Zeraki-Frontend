export interface AggregateStatistics{
	code: string,
	name: string,
	value: number | string,
	out_of?: number,
	change?: number,
	isSingleValue?: boolean,
	suffix?: string
}
