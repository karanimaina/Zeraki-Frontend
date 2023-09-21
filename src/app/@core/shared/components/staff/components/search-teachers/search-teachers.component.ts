import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
	selector: "app-search-teachers",
	templateUrl: "./search-teachers.component.html",
	styleUrls: ["./search-teachers.component.scss"]
})
export class SearchTeachersComponent implements OnInit {
	@Input() staffName!: string;
    @Input() teacherListError!: boolean;
    @Input() searchText = "";

    @Output() togglePrint: EventEmitter<void> = new EventEmitter<void>();
    @Output() filterBy: EventEmitter<Event> = new EventEmitter<Event>();

    constructor() { }

    ngOnInit(): void {
    }

    togglePrintFormat() {
    	this.togglePrint.emit();
    }

    applyFilter($event: Event) {
    	this.filterBy.emit($event);
    }
}
