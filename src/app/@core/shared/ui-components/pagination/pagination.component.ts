import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";

@Component({
	selector: "app-pagination",
	templateUrl: "./pagination.component.html",
	styleUrls: ["./pagination.component.scss"]
})
export class PaginationComponent implements OnInit {
	@Input() itemsPerPage = 10;
	@Input() totalItems!: number;

	@Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

	private _currentPage = 1;


	constructor() { }

	ngOnInit(): void {
	}

	get currentPage(): number {
		return this._currentPage;
	}

	set currentPage(page: number) {
		this._currentPage = page;
		this.pageChanged.emit(page);
	}

	get totalPages(): number {
		return Math.ceil(this.totalItems / this.itemsPerPage);
	}

	onSetPage(event): void {
		this.currentPage = event.target.value;
	}

	onFirstPage(): void {
		this.currentPage = 1;
	}

	onPreviousPage(): void {
		this.currentPage--;
		console.log(this.currentPage);
	}

	onNextPage(): void {
		this.currentPage++;
	}

	onLastPage(): void {
		this.currentPage = this.totalPages;
	}

}
