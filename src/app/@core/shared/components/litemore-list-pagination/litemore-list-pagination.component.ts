import { Component, EventEmitter, Input, Output } from "@angular/core";
import { PageInfo } from "src/app/@core/models/common/pagination";

@Component({
	selector: "app-litemore-list-pagination",
	templateUrl: "./litemore-list-pagination.component.html",
	styleUrls: ["./litemore-list-pagination.component.scss"]
})
export class LitemoreListPaginationComponent {
	@Input() pageInfo?: PageInfo;
	@Output() onPageChange = new EventEmitter<number>();

	loadPreviousPage() {
		if (this.pageInfo) {
			const previousPage = this.pageInfo?.currentPage - 1;
			if ((previousPage > 0) && (previousPage < this.pageInfo?.totalPages)) this.onPageChange.emit(previousPage);
		}
	}

	loadNextPage() {
		if (this.pageInfo) {
			const nextPage = this.pageInfo?.currentPage + 1;
			if (nextPage > 0 && nextPage <= this.pageInfo?.totalPages) this.onPageChange.emit(nextPage);
		}
	}

}
