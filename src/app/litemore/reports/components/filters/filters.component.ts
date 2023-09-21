import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { FormArray, FormControl, Validators } from "@angular/forms";
import { reportType } from "src/app/@core/models/litemore/reports/reports";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import { emptyStringValidator } from "src/app/@core/shared/directives/empty-string-validator.directive";
import { TranslateService } from "@ngx-translate/core";

type usage = "all" | "invoice" | "collections";

interface FilterFields {
	name: string;
	value: string;
	usage: usage;
}

interface ReportTypes {
	name: string;
	value: reportType;
	usage: usage;
}

@Component({
	selector: "app-filters",
	templateUrl: "./filters.component.html",
	styleUrls: ["./filters.component.scss"]
})
export class FiltersComponent implements OnInit {
	@Output() filterFormOutput: EventEmitter<any> = new EventEmitter<any>();
	@Output() reportTypeOutput: EventEmitter<string> = new EventEmitter<string>();
	filterForm!: SubmitFormGroup;
	activeReportType!: reportType;
	reportFilters?: Array<FilterFields>;
	reportTypes: Array<ReportTypes> = [
		{
			name: this.translate.instant(
				"litemore.reports.components.filters.invoice"
			),
			value: "invoices",
			usage: "invoice"
		},
		{
			name: this.translate.instant(
				"litemore.reports.components.filters.proforma"
			),
			value: "proformas",
			usage: "invoice"
		},
		{
			name: this.translate.instant(
				"litemore.reports.components.filters.collections"
			),
			value: "collections",
			usage: "collections"
		}
	];
	filters?: Array<FilterFields> = [
		{
			name: this.translate.instant(
				"litemore.reports.components.filters.startEndDate"
			),
			value: "startDate",
			usage: "all"
		},
		{
			name: this.translate.instant(
				"litemore.reports.components.filters.dueDate"
			),
			value: "dueDate",
			usage: "invoice"
		},
		{
			name: this.translate.instant(
				"litemore.reports.components.filters.itemType"
			),
			value: "itemType",
			usage: "all"
		},
		{
			name: this.translate.instant(
				"litemore.reports.components.filters.signUpDate"
			),
			value: "schoolSignUpDate",
			usage: "all"
		},
		{
			name: this.translate.instant(
				"litemore.reports.components.filters.product"
			),
			value: "product",
			usage: "all"
		}
	];

	constructor(private translate: TranslateService) {}

	ngOnInit(): void {
		this.initializeForm();
		this.changeActiveReportType({
			name: this.translate.instant(
				"litemore.reports.components.filters.invoice"
			),
			value: "invoices",
			usage: "invoice"
		});
	}

	onFilterFormSubmit() {}

	initializeForm() {
		this.filterForm = new SubmitFormGroup({
			checkArray: new FormArray([]),
			startDate: new FormControl("", [
				Validators.required,
				emptyStringValidator
			]),
			endDate: new FormControl("", [Validators.required, emptyStringValidator]),
			dueDate: new FormControl("")
		});
		this.addDefaultFilters();
	}

	addDefaultFilters() {
		const checkArray: FormArray = this.filterForm.get(
			"checkArray"
		) as FormArray;
		checkArray.push(new FormControl("startDate"));
		this.filterFormOutput.emit(this.filterForm);
	}

	onFilterCheckboxChange(event: any) {
		const checkArray: FormArray = this.filterForm.get(
			"checkArray"
		) as FormArray;
		if (event.target.checked) {
			checkArray.push(new FormControl(event.target.value));
			this.filterFormOutput.emit(this.filterForm);
		} else {
			checkArray.controls.forEach((fieldAbstractControl, index) => {
				if (fieldAbstractControl.value == event.target.value) {
					checkArray.removeAt(index);
					this.filterFormOutput.emit(this.filterForm);
					return;
				}
			});
		}
	}

	changeActiveReportType(type: ReportTypes) {
		if (type.value !== this.activeReportType) {
			this.activeReportType = type.value;
			this.reportFilters = this.filters?.filter(
				({ usage }) => usage == type.usage || usage == "all"
			);
			if (type.value == "proformas") {
				this.reportFilters?.push({
					name: "Uninvoiced",
					value: "uninvoiced",
					usage: "invoice"
				});
			}
			this.reportTypeOutput.emit(type.value);
			this.initializeForm();
		}
	}
}
