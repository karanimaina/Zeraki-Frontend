import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
	selector: "app-zeraki-products",
	templateUrl: "./zeraki-products.component.html",
	styleUrls: ["./zeraki-products.component.scss"]
})
export class ZerakiProductsComponent implements OnInit, OnDestroy {
	dataSource: MatTableDataSource<any> = new MatTableDataSource();

	currentPage = 1;
	totalPages!: number;

	searchForm = this.fb.group({
		schoolName: ["", Validators.required],
	});

	get schoolName(): AbstractControl | null {
		return this.searchForm.get("schoolName");
	}


	requiredValidator = Validators.required;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private activatedRoute: ActivatedRoute
	) { }

	ngOnInit(): void {
		this.updateSchoolNameBasedOnQueryParam();
	}

	ngOnDestroy(): void {
	}

	private updateSchoolNameBasedOnQueryParam() {
		this.activatedRoute.queryParams.subscribe(params => {
			if (params["q"]) {
				this.searchForm.patchValue({
					schoolName: params["q"]
				});
			}
		});
	}

	fieldHasErrors(field: AbstractControl): boolean {
		return field?.invalid && (field?.dirty || field?.touched);
	}

	submitSearchForm() {
		const form = this.searchForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const schoolName = form.value["schoolName"];

		this.router.navigate(["search"], { relativeTo: this.activatedRoute, queryParams: { q: schoolName } });
	}
}
