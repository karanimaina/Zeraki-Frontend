import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import {SchoolTypeData} from "../../../../../@core/models/school-type-data";

@Component({
	selector: "app-ordinary-exam",
	templateUrl: "./ordinary-exam.component.html",
	styleUrls: ["./ordinary-exam.component.scss"]
})
export class OrdinaryExamComponent implements OnChanges {

	@Input() isGuineaSchool!: boolean;
	@Input() examOptionSelected!: boolean;
	@Input() series: any;
	@Input() isLoadingForms!: boolean;
	@Input() forms: any;
	@Input() isAddingOrdinaryExam!: boolean;
	@Input() schoolTypeData?: SchoolTypeData;
	@Input() currentYear!: number;
	@Output() createExamEvt: EventEmitter<any> = new EventEmitter();
	@Output() viewManageExamsEvt: EventEmitter<any> = new EventEmitter();

	validYears: Array<number> = [];
	constructor() { }

	ngOnChanges(changes:SimpleChanges): void {
		if (changes.currentYear?.currentValue || changes.schoolTypeData?.currentValue) {
			this.initializeValidYears();
		}
	}

	initializeValidYears() {
		this.validYears = [];
		this.validYears.push(this.currentYear);
		for (let i = 1; i < 5; i++) {
			const year = this.currentYear - i;
			this.validYears.push(year);
		}
	}

	createExam(model: any) {
		this.createExamEvt.emit(model);
	}
}
