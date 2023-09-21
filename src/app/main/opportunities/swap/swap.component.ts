import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { combineLatest, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { Swap } from "src/app/@core/models/swap";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { VacancyService } from "src/app/@core/services/vacancy/vacancy.service";
import { CountryService } from "src/app/@core/shared/services/country/country.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import Swal from "sweetalert2";

@Component({
	selector: "app-swap",
	templateUrl: "./swap.component.html",
	styleUrls: ["./swap.component.scss"]
})
export class SwapComponent implements OnInit {

	dataSource: any;
	allSwaps: any[] = [];
	counties: any[] = [];
	allsubjects: any[] = [];

	addSwap = false;

	firstFormGroup!: FormGroup;
	secondFormGroup!: FormGroup;
	teacher_option = true;
	staff_option = false;
	selected_type = "";
	selected_msgtype = "";
	actStep2 = false;
	swap = new Swap();
	regionFrom: any = {};
	regionTo: any = {};

	userInfo: any;
	categories: any[] = [];
	categories_optionals: any[] = [];
	categories_technicals: any[] = [];
	counter = 0;
	swapsObj: any;

	constructor(
		private vacancyService: VacancyService,
		private countryService: CountryService,
		private userService: UserService,
		private classesService: ClassesService,
		private toastService: HotToastService,
		private translate: TranslateService) {}

	ngOnInit(): void {
		combineLatest([
			this.userService.userInfoSubject,
			this.countryService.getCounties().pipe(catchError(e => of(e))),
		]).subscribe(([userInfo, counties]) => {
			if (userInfo) {
				this.userInfo = userInfo;
				this.counties = counties.countryCounties.counties;
	
				this.swap.countyFrom = this.userInfo?.county;
				this.getSubCounties(userInfo.countyId);
				this.swap.createdBy = this.userInfo?.name;
				this.swap.schoolFrom = this.userInfo?.schoolname;
				this.swap.uploaderPhone = this.userInfo?.phone;
			}

		});
		this.getSwaps(1);
		this.regionFrom.county = {};
		this.regionTo.county = {};
		this.getSubjects();
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		//console.warn("filterValue >> ", typeof filterValue, filterValue, filterValue == "");
		// this.dataSource.filter = filterValue.trim().toLowerCase();
		// //  //console.warn("Filtered DataSource", this.dataSource.filteredData);

		const isSubject = this.allsubjects.find(({ name }) => name === filterValue.trim());
		const isCounty = this.counties.find(({ name }) => name === filterValue.trim());

		//  //console.warn('isSubject >> ', isSubject);
		//  //console.warn('isCounty >> ', isCounty);

		if (isSubject) {
			this.vacancyService.searchSwap(0, isSubject.subjectId).subscribe({
				next: (resp: any) => {
					//  //console.warn('Filter >> ', resp);
					this.dataSource = new MatTableDataSource(resp.swap);
				},
				error: err => {
					//console.error("Filter error >> ", err);
					const message = this.translate.instant("common.toastMessages.searchError");
					this.toastService.error(message);
				}
			});
		} else if (isCounty) {
			this.vacancyService.searchSwap(isCounty.countyid).subscribe({
				next: (resp: any) => {
					//  //console.warn('Filter >> ', resp);
					this.dataSource = new MatTableDataSource(resp.swap);
				},
				error: err => {
					//console.error("Filter error >> ", err);
					const message = this.translate.instant("common.toastMessages.searchError");
					this.toastService.error(message);
				}
			});
		} else {
			this.vacancyService.searchSwap(0).subscribe({
				next: (resp: any) => {
					//  //console.warn('Filter >> ', resp);
					this.dataSource = new MatTableDataSource(resp.swap);
				},
				error: err => {
					//console.error("Filter error >> ", err);
					const message = this.translate.instant("common.toastMessages.searchError");
					this.toastService.error(message);
				}
			});
		}
	}

	getSwaps(page: number) {
		this.addSwap = false;
		this.vacancyService.getAllSwaps(page).subscribe({
			next: (resp: any) => {
				//  //console.warn("Swaps Obj >> ", resp);
				this.swapsObj = resp;
				this.allSwaps = resp.swap;
				this.dataSource = new MatTableDataSource(this.allSwaps);
			},
			error: err => {
				//console.error(err);
			}
		});
	}

	OgetSwaps(page: any) {
		this.getSwaps(page);
	}

	previousPage() {
		this.getSwaps(this.swapsObj.currentPage - 1);
	}

	nextPage() {
		this.getSwaps(this.swapsObj.currentPage + 1);
	}

	editSwap(swapEdit: any) {
		this.swap = swapEdit;
		this.addSwap = true;
		//  //console.warn(swapEdit);
		this.swap.countyFrom = this.counties.find(({ name }) => name === swapEdit.countyFromName);
		this.swap.subcountyFrom = this.regionFrom.county.sub_counties.find(({ subCountyId }) => subCountyId === swapEdit.subCountyFromId);
		this.swap.countyTo = this.counties.find(({ countyid }) => countyid === swapEdit.countyToId);
		this.getSubCounties(swapEdit.countyToId, false, true, swapEdit);

		let mainSubjects: any[] = [];
		for (let sub = 0; sub < this.allsubjects.length; sub++) {
			if (swapEdit.subject1Name === this.allsubjects[sub].name) {
				//  //console.warn(">> ", this.allsubjects[sub]);
				this.allsubjects[sub].selected = true;
				mainSubjects = [...mainSubjects, this.allsubjects[sub]];
			}
			if (swapEdit.subject2Name === this.allsubjects[sub].name) {
				this.allsubjects[sub].selected = true;
				mainSubjects = [...mainSubjects, this.allsubjects[sub]];
			}
		}
		this.counter = mainSubjects.length;
		//  //console.warn("mains >> ", mainSubjects, mainSubjects.length);
		this.swap.createdBy = this.userInfo.name;
		this.swap.uploaderPhone = this.userInfo.phone;
	}

	newSwap() {
		this.addSwap = true;
		this.swap = {
			swapId: null,
			createdBy: this.swap.createdBy,
			uploaderPhone: this.swap.uploaderPhone,
			schoolFrom: this.swap.schoolFrom,
			datePosted: "",
			postedBy: "",
			subject1Name: "",
			subject1Id: "",
			subject2Name: "",
			subject2Id: "",
			countyFrom: this.swap.countyFrom,
			subcountyFrom: "",
			countyTo: "",
			subcountyTo: "",
			displayUploaderContact: true
		};
	}

	OgetSubCounties(params: any) {
		this.getSubCounties(params.countyid, params.from);
	}

	getSubCounties(countyid: any, from = true, edit = false, swapEdit?: any) {
		if (from) {
			this.countryService.getSubCounties(countyid).subscribe((resp: any) => {
				//  //console.warn("Sub counties From >> ", resp.subCounties);
				this.regionFrom.county.sub_counties = resp.subCounties;
			});
		} else {
			if (edit) {
				this.countryService.getSubCounties(countyid).subscribe((resp: any) => {
					//  //console.warn("Sub counties To >> ", resp.subCounties);
					this.swap.subcountyTo = resp.subCounties.find(({ subCountyId }) => subCountyId === swapEdit?.subCountyToId);
					this.regionTo.county.sub_counties = resp.subCounties;
				});
			} else {
				this.countryService.getSubCounties(countyid).subscribe((resp: any) => {
					//  //console.warn("Sub counties To >> ", resp.subCounties);
					this.regionTo.county.sub_counties = resp.subCounties;
				});
			}
		}
	}

	getSubjects() {
		this.classesService.getSubjects().subscribe(val => {
			// //  //console.warn("getSubjects >> ", val);
			const allsubjectsObj: any = val;
			this.allsubjects = allsubjectsObj.subjects;
			// this.routeId? this.editStream(): this.initSubjects(this.allsubjects, false);
			this.initSubjects(this.allsubjects, false);
		});
	}

	//init subjects
	initSubjects(subjects: any[] | null | undefined, isNewCurriculum: boolean) {
		if (subjects != undefined && subjects != null && subjects.length > 0) {
			for (let i = 0; i < subjects.length; i++) {
				const subject = subjects[i];

				let add_category = true;
				subject.isNewCurriculum = isNewCurriculum;
				subject.selected = false;
				subject.hidden = false;
				// if (this.compulsory_subject_int_codes.indexOf(subject.intCode) != -1) {
				//   subject.disabled = true;
				// }

				// if (subject.intCode == 443 || subject.intCode == 565) {
				//   subject.selected = true;
				// }

				if (subject.category.id != 5 && subject.category.id != 6) {
					// subject.selected = true;
					if (subject.intCode == 281) {
						// subject.selected = false;
						subject.hidden = true;
					}
					for (let j = 0; j < this.categories.length; j++) {
						const category = this.categories[j];
						if (subject.category.id == category.id) {
							category.subjects.push(subject);
							add_category = false;
						}
					}

					if (add_category) {
						const category = subject.category;
						category.subjects = [subject];
						this.categories.push(category);
					}
				} else if (subject.category.id == 5) {

					for (let k = 0; k < this.categories_technicals.length; k++) {
						const category = this.categories_technicals[k];
						if (subject.category.id == category.id) {
							category.subjects.push(subject);
							add_category = false;
						}
					}
					if (add_category) {
						const category = subject.category;
						category.subjects = [subject];
						this.categories_technicals.push(category);
					}
				} else if (subject.category.id == 6) {
					for (let l = 0; l < this.categories_optionals.length; l++) {
						const category = this.categories_optionals[l];
						if (subject.category.id == category.id) {
							category.subjects.push(subject);
							add_category = false;
						}
					}
					if (add_category) {
						const category = subject.category;
						category.subjects = [subject];
						this.categories_optionals.push(category);
					}
				}
			}
			//console.log(this.categories_optionals[0]);
		}
	}

	deleteSwap(swapObj: any) {
		//  //console.warn("swap to delete >> ", swapObj);
		Swal.fire({
			title: this.translate.instant("opportunities.swap.swal.title"),
			text: this.translate.instant("opportunities.swap.swal.text", { name1: swapObj.subject1Name, name2: swapObj.subject2Name }),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#43ab49",
			cancelButtonColor: "#ff562f",
			confirmButtonText: this.translate.instant("opportunities.swap.swal.confirmButtonText")
		}).then((result) => {
			if (result.isConfirmed) {
				this.vacancyService.deleteSwap(swapObj.swapId)
					.subscribe({
						next: (data: any) => {
							//  //console.warn("DATA >> ", data);
							this.getSwaps(1);
							//console.log(data.response.message);

							const message = this.translate.instant("opportunities.swap.toastMessages.deleteSuccess");
							this.toastService.success(message);
						},
						error: error => {
							// this.errorMessage = error.message;
							//console.error("There was an error!", error);
							const message = this.translate.instant("opportunities.swap.toastMessages.deleteSwapError");
							this.toastService.error(message);
						}
					});
			}
		});
	}

	closeSwap(close: any) {
		this.addSwap = close;
	}

}
