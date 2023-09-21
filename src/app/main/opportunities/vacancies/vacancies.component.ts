import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import * as FileSaver from "file-saver";
import * as moment from "moment";
import { combineLatest, Observable, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { Role } from "../../../@core/models/Role";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { VacancyService } from "src/app/@core/services/vacancy/vacancy.service";
import { CountryService } from "src/app/@core/shared/services/country/country.service";

@Component({
	selector: "app-vacancies",
	templateUrl: "./vacancies.component.html",
	styleUrls: ["./vacancies.component.scss"]
})
export class VacanciesComponent implements OnInit {
	selectedFilter = "";
	vacancyType = 1;
	dataSource: any;
	counties: any[] = [];
	addVacancy = false;
	allsubjects: any = [];

	categories: any[] = [];
	categories_optionals: any[] = [];
	categories_technicals: any[] = [];
	compulsory_subject_int_codes: any[] = [];

	isLinear = true;
	firstFormGroup!: FormGroup;
	secondFormGroup!: FormGroup;
	teacher_option = true;
	staff_option = false;
	selected_type = "";
	selected_msgtype = "";
	actStep2 = false;
	vacancy: { title: string, description: any, postedOn: any, postedBy: string, displayName: string, phoneNumber: string, school: string, county: string, subCounty: any, subCountyId: any, subject1: any, subject1Id: any, subject2: any, subject2Id: any, applyByDate: any, contentType: number, showPhone: boolean, vacancyType: number, vacancyId: number | null } = { title: "", description: "", postedOn: "", postedBy: "", displayName: "", phoneNumber: "", school: "", county: "", subCounty: "", subCountyId: null, subject1: "", subject1Id: "", subject2: "", subject2Id: "", applyByDate: "", contentType: 2, showPhone: true, vacancyType: 1, vacancyId: null };
	region: any = {};
	vacancyObj: any = [];
	counter = 0;
	userInfo: any = null;
	schoolProfile: any;

	text_option = true;
	file_option = false;
	file_input: any;
	selectedFile: any;
	isEdit = false;
	editUpload = false;
	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	today = moment().add(1, "day").format("YYYY-MM-DD");

	constructor(
		private vacancyService: VacancyService,
		private classesService: ClassesService,
		private dataService: DataService,
		private countryService: CountryService,
		private userService: UserService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private rolesService: RolesService
	) {}

	ngOnInit(): void {
		combineLatest([
			this.userService.userInfoSubject.pipe(catchError(e => of(e))),
			this.dataService.getSchoolProfile().pipe(catchError(e => of(e))),
			this.countryService.getCounties().pipe(catchError(e => of(e))),
		]).subscribe(([userInfo, schoolProfile, counties]) => {

			if (userInfo) {
				this.userInfo = userInfo;
				this.schoolProfile = schoolProfile;
				this.counties = counties;
	
				this.vacancy.displayName = this.userInfo.name;
				this.vacancy.school = this.userInfo.schoolname;
	
				this.vacancy.phoneNumber = this.schoolProfile.phone;
				this.vacancy.county = this.userInfo.county;
				this.getSubCounties(this.userInfo.countyId);	
			}
		});
		this.changeFilter("teaching");
		this.region.county = {};
		this.region.subcounty = {};
		this.getSubjects();
		//  console.warn("this.teacher_option >> ", this.teacher_option);
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value.toUpperCase();
		//  console.warn('filterValue >> ', typeof filterValue, filterValue, filterValue == "");
		// this.dataSource.filter = filterValue.trim().toLowerCase();
		// //  console.warn("Filtered DataSource", this.dataSource.filteredData);
		// console.warn('allsubjects >> ', this.allsubjects);
		const isSubject = this.allsubjects.find(({ name }) => name.toUpperCase().includes(filterValue.trim()));
		console.warn("isSubject >> ", isSubject);

		if (!isSubject || filterValue == "") {
			this.vacancyService.searchVacancies(this.vacancy.vacancyType, filterValue.trim()).subscribe({
				next: (resp: any) => {
					//  console.warn('Filter >> ', resp);
					this.dataSource = new MatTableDataSource(resp.vacancies);
				},
				error: err => {
					console.error("Filter error >> ", err);
					const message = this.translate.instant("common.toastMessages.searchError");
					this.toastService.error(message);
				}
			});
		} else {
			this.vacancyService.searchVacancies(this.vacancy.vacancyType, undefined, isSubject.subjectId).subscribe({
				next: (resp: any) => {
					//  console.warn('Filter >> ', resp);
					this.dataSource = new MatTableDataSource(resp.vacancies);
				},
				error: err => {
					console.error("Filter error >> ", err);
					const message = this.translate.instant("common.toastMessages.searchError");
					this.toastService.error(message);
				}
			});
		}
	}

	toggleRecipient(option: string) {
		//  console.warn("Rec", option);
		switch (option) {
		case "teaching":
			this.teacher_option = true;
			this.staff_option = false;
			this.selected_type = "Teaching";
			this.vacancy.vacancyType = 1;
			this.selected_msgtype = "";
			break;
		case "nonTeaching":
			this.teacher_option = false;
			this.staff_option = true;
			this.selected_type = "Non-teaching";
			this.vacancy.vacancyType = 2;
			this.selected_msgtype = "";
			break;
		default:
			this.teacher_option = true;
			this.staff_option = false;
			this.selected_type = "Teaching";
			this.vacancy.vacancyType = 1;
			this.selected_msgtype = "";
			break;
		}

		this.actStep2 = true;
	}

	countyChanged() {
		this.region.county = this.vacancy.county;
		this.vacancy.subCounty = "";
		//  console.warn('this.vacancy.county >> ', this.vacancy.county);
		//  console.warn('this.region.county.countyid >> ', this.region.county);
		this.getSubCounties(this.region.county.countyid);
	}

	getSubCounties(countyid: any) {
		this.countryService.getSubCounties(countyid).subscribe((resp: any) => {
			//  console.warn("Sub counties >> ", resp);
			this.region.county.sub_counties = resp.subCounties;
		});
	}

	getAllVacancies(type: number, currentPage: number) {
		this.vacancyService.getAllVacancies(type, currentPage).subscribe(resp => {
			//  console.warn("RESP >>", resp);
			this.vacancyObj = resp;
			this.dataSource = new MatTableDataSource(this.vacancyObj.vacancies);
		});
	}

	previousPage() {
		this.getAllVacancies(this.vacancyType, this.vacancyObj - 1);
	}

	nextPage() {
		this.getAllVacancies(this.vacancyType, this.vacancyObj + 1);
	}

	changeFilter(vacancy: string) {
		this.addVacancy = false;
		for (let sub = 0; sub < this.allsubjects.length; sub++) {
			this.allsubjects[sub].selected = false;
		}
		this.counter = 0;
		switch (vacancy) {
		case "staff":
			this.selectedFilter = "Non-teaching staff";
			this.vacancyType = 2;
			this.getAllVacancies(this.vacancyType, 1);
			this.toggleRecipient("nonTeaching");
			break;
		case "teaching":
			this.selectedFilter = "Teaching staff";
			this.vacancyType = 1;
			this.getAllVacancies(this.vacancyType, 1);
			this.toggleRecipient("teaching");
			break;

		default:
			this.selectedFilter = "Teaching staff";
			this.vacancyType = 1;
			this.getAllVacancies(this.vacancyType, 1);
			this.toggleRecipient("teaching");
			break;
		}
	}

	editVacancy(vac: any) {
		console.warn("editVacancy >> ", vac);
		this.isEdit = true;
		this.vacancy = vac;
		this.toggleContentType(this.vacancy.contentType);
		this.vacancy.applyByDate = moment(new Date(this.vacancy.applyByDate)).format("YYYY-MM-DD");
		//  console.warn("this.teacher_option >> ", this.teacher_option);
		this.addVacancy = true;
		const mainSubjects: any[] = [];
		if (this.teacher_option) {
			for (let sub = 0; sub < this.allsubjects.length; sub++) {
				if (this.vacancy.subject1 === this.allsubjects[sub].name) {
					mainSubjects.push(this.allsubjects[sub]);
					this.allsubjects[sub].selected = true;
				}
				if (this.vacancy.subject2 === this.allsubjects[sub].name) {
					mainSubjects.push(this.allsubjects[sub]);
					this.allsubjects[sub].selected = true;
				}
			}
			this.counter = mainSubjects.length;
			//  console.warn("Main Subjects edit >> ", mainSubjects);
		}
		if (this.vacancy.vacancyType == 1) {
			this.toggleRecipient("teaching");
		} else if (this.vacancy.vacancyType == 2) {
			this.toggleRecipient("nonTeaching");
		}

	}

	getSubjects() {
		this.classesService.getSubjects().subscribe(val => {
			console.warn("getSubjects >> ", val);
			const allsubjectsObj: any = val;
			this.allsubjects = allsubjectsObj.subjects;
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
			console.log(this.categories_optionals[0]);
		}
	}

	setSelectValue(subject: any) {
		subject.selected = !subject.selected;
		// //  console.warn(subject);
		if (subject.selected == true) {
			if (this.counter < 2) {
				this.counter++;
			} else {
				this.counter = 2;
			}
		} else if (subject.selected == false) {
			if (this.counter > 0) {
				this.counter--;
			} else {
				this.counter = 0;
			}
		}
	}

	newVacancy() {
		// this.toggleRecipient('teaching');
		this.addVacancy = true;

		this.vacancy = { title: "", description: "", postedOn: "", postedBy: "", displayName: "", phoneNumber: "", school: "", county: "", subCounty: "", subCountyId: null, subject1: "", subject1Id: "", subject2: "", subject2Id: "", applyByDate: "", contentType: 2, showPhone: true, vacancyType: this.vacancy.vacancyType, vacancyId: null };

		this.vacancy.displayName = this.userInfo.name;
		this.vacancy.school = this.userInfo.schoolname;

		this.vacancy.phoneNumber = this.schoolProfile.phone;
		this.vacancy.county = this.userInfo.county;
		//  console.warn("userInfo.countyId >> ", this.userInfo.countyId);
		this.toggleContentType(this.vacancy.contentType);
	}

	saveVacancies() {
		const mainSubjects: any[] = [];

		for (let i = 0; i < this.allsubjects.length; i++) {
			const subject = this.allsubjects[i];
			if (subject.selected == true) {
				mainSubjects.push(subject);
			}
			// //  console.warn("subject", subject);
			// //  console.warn("selected", subject.selected);
		}
		//  console.warn("vacancy", this.vacancy);
		if (this.teacher_option) {
			this.vacancy.subject1 = mainSubjects[0]?.name;
			this.vacancy.subject1Id = mainSubjects[0]?.subjectId;
			this.vacancy.subject2 = mainSubjects[1]?.name;
			this.vacancy.subject2Id = mainSubjects[1]?.subjectId;
		} else {
			this.vacancy.subject1 = null;
			this.vacancy.subject1Id = null;
			this.vacancy.subject2 = null;
			this.vacancy.subject2Id = null;
		}

		console.warn("this.vacancy.applyByDate >> ", this.vacancy.applyByDate);
		this.vacancy.applyByDate = moment(this.vacancy.applyByDate, "YYYY-MM-DD").format("YYYY/MM/DD");
		console.warn("this.vacancy.applyByDate1 >> ", this.vacancy.applyByDate);
		this.vacancy.applyByDate = new Date(this.vacancy.applyByDate).getTime();
		console.warn("this.vacancy.applyByDate2 >> ", this.vacancy.applyByDate);

		if (this.vacancy.vacancyId == null) {

			const vacancyObject = {
				title: this.vacancy.title,
				description: this.vacancy.description,
				applyByDate: this.vacancy.applyByDate,
				vacancyType: this.vacancy.vacancyType,
				subCountyId: this.vacancy.subCounty.subCountyId,
				showPhone: this.vacancy.showPhone,
				phoneNumber: this.vacancy.phoneNumber,
				subject1Id: this.vacancy.subject1Id,
				subject2Id: this.vacancy.subject2Id,
				displayName: this.vacancy.displayName,
				contentType: this.vacancy.contentType
			};
			const finalObj = this.getFormData(vacancyObject);

			//  console.warn("Current vacancy >> ", this.vacancy);
			console.warn("Save vacancy >> ", vacancyObject);
			//  console.warn("finalObj >> ", finalObj);

			if (this.vacancy.contentType == 1) {
				const newObject = {
					vacancy: vacancyObject,
					file: this.selectedFile
				};
				//  console.warn("File input >>", this.selectedFile);

				const newFormObject = this.getNewData(newObject);

				this.vacancyService.saveVacancyFormData(newFormObject).subscribe({
					next: (resp: any) => {
						//  console.warn('saveVacancy >> ', resp);
						console.log(resp.response.message);

						const message = this.translate.instant("opportunities.vacancies.toastMessages.saveSuccess");
						this.toastService.success(message);

						this.vacancyType == 1 ? this.changeFilter("teaching") : this.changeFilter("staff");
						for (let sub = 0; sub < this.allsubjects.length; sub++) {
							this.allsubjects[sub].selected = false;
						}
						this.counter = 0;
					},
					error: err => {
						console.error("saveVacancy >> ", err);

						const msg = err.error.response.message;
						this.toastService.warning(msg);
					}

				});
			} else if (this.vacancy.contentType == 2) {
				this.vacancyService.saveVacancyFormData(finalObj).subscribe({
					next: (resp: any) => {
						//  console.warn('saveVacancy >> ', resp);
						console.log(resp.response.message);

						const message = this.translate.instant("opportunities.vacancies.toastMessages.saveSuccess");
						this.toastService.success(message);

						this.vacancyType == 1 ? this.changeFilter("teaching") : this.changeFilter("staff");
						for (let sub = 0; sub < this.allsubjects.length; sub++) {
							this.allsubjects[sub].selected = false;
						}
						this.counter = 0;
					},
					error: err => {
						console.error("saveVacancy >> ", err);

						// console.log(this.vacancy.applyByDate);
						this.vacancy.applyByDate = moment(new Date(this.vacancy.applyByDate)).format("YYYY-MM-DD");
						// console.log(this.vacancy.applyByDate);

						const msg = err.error.response.message;
						this.toastService.warning(msg);
					}

				});
			}
		} else {
			const updateObject = {
				title: this.vacancy.title,
				description: this.vacancy.description,
				applyByDate: this.vacancy.applyByDate,
				vacancyType: this.vacancy.vacancyType,
				contentType: this.vacancy.contentType,
				vacancyId: this.vacancy.vacancyId,
				subCountyId: this.vacancy.subCounty.subCountyId || this.vacancy.subCountyId,
				showPhone: this.vacancy.showPhone,
				subject1Id: this.vacancy.subject1Id,
				subject2Id: this.vacancy.subject2Id
			};

			const finalObj = this.getFormData(updateObject);

			// //  console.warn("Current vacancy >> ", this.vacancy);
			// //  console.warn("Save vacancy >> ", vacancyObject);
			//  console.warn("finalObj Update >> ", finalObj);

			if (this.vacancy.contentType == 1) {
				const newObject = {
					vacancy: updateObject,
					file: this.selectedFile
				};
				//  console.warn("File input >>", this.selectedFile);

				const newFormObject = this.getNewData(newObject);

				this.vacancyService.updateVacancy(newFormObject).subscribe({
					next: (resp: any) => {
						//  console.warn('Update CT 1 >> ', resp);
						console.log(resp.response.message);

						const message = this.translate.instant("opportunities.vacancies.toastMessages.updateSuccess");
						this.toastService.success(message);

						for (let sub = 0; sub < this.allsubjects.length; sub++) {
							this.allsubjects[sub].selected = false;
						}
						this.counter = 0;
					},
					error: err => {
						console.error("saveVacancy ERR>> ", err);

						const msg = err.error.response.message;
						this.toastService.warning(msg);
					},
					complete: () => {
						this.vacancyType == 1 ? this.changeFilter("teaching") : this.changeFilter("staff");
						this.isEdit = false;
						this.editUpload = false;
					}

				});
			} else if (this.vacancy.contentType == 2) {
				this.vacancyService.updateVacancy(finalObj).subscribe({
					next: (resp: any) => {
						//  console.warn('Update CT 2 >> ', resp);
						console.log(resp.response.message);

						const message = this.translate.instant("opportunities.vacancies.toastMessages.updateSuccess");
						this.toastService.success(message);

						for (let sub = 0; sub < this.allsubjects.length; sub++) {
							this.allsubjects[sub].selected = false;
						}
						this.counter = 0;
					},
					error: err => {
						console.error("saveVacancy ERR >> ", err);

						const msg = err.error.response.message;
						this.toastService.warning(msg);
					},
					complete: () => {
						this.vacancyType == 1 ? this.changeFilter("teaching") : this.changeFilter("staff");
						this.isEdit = false;
						this.editUpload = false;
					}

				});
			}
		}
	}

	deleteVacancy(vacObj: any) {
		//  console.warn("Vacancy to delete >> ", vacObj);
		Swal.fire({
			title: this.translate.instant("opportunities.vacancies.swal.title"),
			text: this.translate.instant("opportunities.vacancies.swal.text", { title: vacObj.title }),
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ff562f",
			cancelButtonColor: "#43ab49",
			confirmButtonText: this.translate.instant("opportunities.vacancies.swal.confirmButtonText")
		}).then((result) => {
			if (result.isConfirmed) {
				this.vacancyService.deleteVacancy(vacObj.vacancyId).subscribe({
					next: (resp: any) => {
						//  console.warn("del resp >> ", resp);
						console.log(resp.response.message);

						const message = this.translate.instant("opportunities.vacancies.toastMessages.deleteSuccess");
						this.toastService.success(message);

						this.vacancyType == 1 ? this.changeFilter("teaching") : this.changeFilter("staff");
					},
					error: err => {
						console.error("err >> ", err);

						const message = this.translate.instant("common.toastMessages.anErrorOccurred");
						this.toastService.error(message);
					},
				});
			}
		});
	}

	getFormData(object: any) {
		//  console.warn(object);
		const formData = new FormData();
		// //  console.warn("parse", JSON.parse(JSON.stringify(object)), typeof);
		formData.append("vacancy", JSON.stringify(object));
		// Object.keys(object).forEach(key => formData.append(key, object[key]));
		// formData.append('vacancy', JSON.parse(JSON.stringify(formData)));
		//  console.warn('formdata >> ', formData);
		return formData;
	}

	getNewData(object: any) {
		//  console.warn(object);
		//  console.warn(object.keys);
		const formData = new FormData();
		// //  console.warn("parse", JSON.parse(JSON.stringify(object)), typeof);
		// formData.append('vacancy', JSON.stringify(object));

		// if (object.vacancy) {
		//   formData.append('vacancy', JSON.stringify(object));
		// } else {
		//   Object.keys(object).forEach(key => formData.append(key, object[key]));
		// }


		Object.keys(object).forEach(key => {
			//  console.warn('keys >> ', key);
			if (key == "vacancy") {
				formData.append("vacancy", JSON.stringify(object[key]));
			} else {
				formData.append(key, object[key]);
			}

		});
		// formData.append('vacancy', JSON.parse(JSON.stringify(formData)));
		//  console.warn('new formdata >> ', formData);
		return formData;
	}

	detectFiles(event: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);
		// target.files.length == 1? this.isFileSelected = true: this.isFileSelected = false;
		// this.vacancy.description = target.files[0];
		//  console.warn("File >>", target.files[0]);
		this.vacancy.description = target.files[0].name;
		this.selectedFile = target.files[0];
	}

	toggleContentType(value: number) {
		switch (value) {
		case 1:
			this.vacancy.contentType = 1;
			this.file_option = true;
			this.text_option = false;
			break;
		case 2:
			this.vacancy.contentType = 2;
			this.file_option = false;
			this.text_option = true;
			break;
		default:
			this.vacancy.contentType = 1;
			this.file_option = true;
			this.text_option = false;
			break;
		}
	}

	// unselectSubjects() {
	//   // //  console.warn("Unselecting...");
	//   // for (let sub = 0; sub < this.allsubjects.length; sub++) {
	//   //   this.allsubjects[sub].selected = false;
	//   // }
	//   // this.counter = 0;
	// }

	downloadFile(link: string, name: string) {
		FileSaver.saveAs(link, `${name}.pdf`);
	}

}
