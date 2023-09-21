import { Pipe, PipeTransform } from "@angular/core";

/**
 * returns the 1-based index of the list item's index based on the pagination
 * parameters (`currentPage` and `itemsPerPage`) provided
 */
@Pipe({
	name: "paginatedListIndex"
})
export class PaginatedListIndexPipe implements PipeTransform {
	transform(index: number, currentPage = 1, itemsPerPage = 50): number {
		let pageCoefficient: number;

		if (currentPage === 1) {
			pageCoefficient = 0;
		} else {
			pageCoefficient = (currentPage - 1) * itemsPerPage;
		}

		return index + 1 + pageCoefficient;
	}
}
