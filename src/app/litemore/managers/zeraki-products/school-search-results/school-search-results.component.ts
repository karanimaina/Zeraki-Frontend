import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { LitemoreService } from "../../../../@core/services/litemore/litemore.service";
import { TranslateService } from "@ngx-translate/core";
import { HotToastService } from "@ngneat/hot-toast";
import { ZerakiProductSchool } from "../../../../@core/models/litemore/zeraki-products/zeraki-product-school";
import { FormBuilder, FormGroup } from "@angular/forms";

@Component({
	selector: "app-school-search-results",
	templateUrl: "./school-search-results.component.html",
	styleUrls: ["./school-search-results.component.scss"]
})
export class SchoolSearchResultsComponent implements OnInit {
	searchQuery!: string;
	school?: ZerakiProductSchool;

	currentPage = 1;
	itemsPerPage = 10;
	totalPages!: number;

	loadingSchools!: boolean;
	schoolList: ZerakiProductSchool[] = [];
	productActivationStatus = [
		{
			name: "Enable",
			value: 1
		},
		{
			name: "Disable",
			value: 0
		}
	];

	updateSchool: { [key: string]: boolean } = {};
	updatingSchool: { [key: string]: boolean } = {};
	updateSchoolProductForm!: FormGroup;

	constructor(
		private activatedRoute: ActivatedRoute,
		private litemoreService: LitemoreService,
		private fb: FormBuilder,
		private translateService: TranslateService,
		private toastService: HotToastService) {}

	ngOnInit(): void {
		this.activatedRoute.queryParams.subscribe((params) => {
			this.searchQuery = params.q;
			this.searchSchools();
		});
	}


	private searchSchools() {
		this.loadingSchools = true;
		this.schoolList = [];
		this.litemoreService.getZerakiProducts(this.searchQuery)
			.subscribe((schools) => {
				this.loadingSchools = false;
				this.schoolList = schools;
				this.initiateUpdateSchoolProductForm();
			}, () => {
				this.loadingSchools = false;
			});
	}

	private initiateUpdateSchoolProductForm() {
		const formArray = this.schoolList.map((school) => {
			return this.fb.group({
				schoolId: school.schoolId,
				financeStatus: school.schoolOptions.financeStatus,
				analyticsStatus: school.schoolOptions.analyticsStatus,
				timetableStatus: school.schoolOptions.timetableStatus,
			});
		});

		this.updateSchoolProductForm = this.fb.group({
			schoolProductForm: this.fb.array(formArray)
		});
	}

	editSchool(school: ZerakiProductSchool) {
		this.updateSchool[school.schoolId] = !this.updateSchool[school.schoolId];
	}

	saveSchoolProducts(school: ZerakiProductSchool, schoolIndex: number) {
		const schoolProductForm = this.updateSchoolProductForm.get("schoolProductForm")?.get(schoolIndex.toString());

		const payload = {
			schoolId: school.schoolId,
			schoolOptions: {
				financeStatus: schoolProductForm?.get("financeStatus")?.value,
				analyticsStatus: schoolProductForm?.get("analyticsStatus")?.value,
				timetableStatus: schoolProductForm?.get("timetableStatus")?.value,
			}
		};

		this.updatingSchool[school.schoolId] = true;
		this.litemoreService.updateZerakiProducts(payload).subscribe({
			next: () => {
				this.updatingSchool[school.schoolId] = false;
				this.updateSchool[school.schoolId] = !this.updateSchool[school.schoolId];

				this.toastService.success(this.translateService.instant("litemore.zerakiProducts.toastMessages.productUpdateSuccess"));

				school.schoolOptions.financeStatus = payload.schoolOptions.financeStatus;
				school.schoolOptions.analyticsStatus = payload.schoolOptions.analyticsStatus;
				school.schoolOptions.timetableStatus = payload.schoolOptions.timetableStatus;
			},
			error: (err) => {
				this.updatingSchool[school.schoolId] = false;
				const nothingToUpdate = (err.status === 400) && (err.error.response.title as string).includes("Nothing to update");

				if (nothingToUpdate) {
					const message = this.translateService.instant("litemore.zerakiProducts.toastMessages.nothingToUpdateMsg");
					this.toastService.warning(message);
				} else {
					this.toastService.error(this.translateService.instant("common.toastMessages.anErrorOccurred2"));
				}
			}
		});


	}
}
