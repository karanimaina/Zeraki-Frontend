export class DateFormatter {
	/**
	 * Formats a date string input from yyyy-mm-dd to dd/mm/yyyy
	 * @param date
	 * @param separator
	 */
	static formatToDdMmYy(date, separator = "/"): string {
		if (!date) return "";

		const datePart = date.match(/\d+/g);
		const year = datePart[0];
		const month = datePart[1];
		const day = datePart[2];
        
		return `${day}${separator}${month}${separator}${year}`;
	}

	/**
	 * Formats a date string input from dd/mm/yyyy to yyyy-mm-dd
	 * @param date
	 * @param separator
	 */
	static formatToYyMmDd(date, separator = "/"): string {
		if (!date) return "";

		const datePart = date.match(/\d+/g);
		const year = datePart[2];
		const month = datePart[1];
		const day = datePart[0];

		return `${year}${separator}${month}${separator}${day}`;
	}
}