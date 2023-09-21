import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { BaseStream, GraduatedIntake, SchoolIntake, SchoolStream, SchoolTypeData } from "src/app/@core/models/school-type-data";
import { PrintoutsService } from "src/app/@core/services/printouts/printouts.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { environment } from "src/environments/environment";
import Swal from "sweetalert2";
import { SchoolService } from "../../../@core/shared/services/school/school.service";
import { SchoolInfo } from "src/app/@core/models/school-info";
import { BasicUtils } from "src/app/@core/shared/utilities/basic.utils";

@Component({
	selector: "app-leaving-certs",
	templateUrl: "./leaving-certs.component.html",
	styleUrls: ["./leaving-certs.component.scss"]
})
export class LeavingCertsComponent implements OnInit {
	schoolProfile!: SchoolInfo;
	selectedIntakeStreams: Array<SchoolStream | BaseStream> = [];
	filterForm: { intake: SchoolIntake | GraduatedIntake | null, stream: SchoolStream | null } = {intake: null, stream: null};
	isLoading = false;
	searchClicked = false;
	showDataResults = false;
	studentResult: any[] = [];
	paginate_results: any;
	data_limit_length = 10;

	showingDocument = false;
	selectedStudent: any = {};
	studentCertificate: any = {};

	isExporting = false;
	pdfSrc: any;
	createdPDF: any;
	allIntakes: Array<any> = [];

	/**Get user roles from subject */
	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	schoolTypeData!: SchoolTypeData;

	constructor(
		private dataService: DataService,
		private router: Router,
		private toastService: HotToastService,
		private printoutsService: PrintoutsService,
		private responseHandlerService: ResponseHandlerService,
		private rolesService: RolesService,
		private translate: TranslateService,
		private schoolService: SchoolService
	) { }

	ngOnInit(): void {
		this.getSchoolProfile();
		this.getGraduatedClasses();
	}

	getGraduatedClasses() {
		this.dataService.schoolData.subscribe(resp => {
			this.schoolTypeData = resp;
			this.allIntakes = [];
			this.allIntakes = [...(this.schoolTypeData?.current_forms_list || []), ...(this.schoolTypeData?.graduated_forms_list || [])];
		});
	}

	getSchoolProfile() {
		this.schoolService.schoolInfo.subscribe(resp => {
			this.schoolProfile = resp;
		});
	}

	graduatedClassesChange() {
		this.filterForm.stream = null;
		this.selectedIntakeStreams = this.filterForm?.intake?.streams || [];
	}

	pagerClicked(object: any) {
		if (object.status) {
			this.paginate_results = this.paginate(this.studentResult, object.page, this.data_limit_length);
		}
	}

	paginate(list: any, pageNumber: number, limit: number) {
		const response: any = {
			next: { status: false, page: 0 },
			prev: { status: false, page: 0 },
			data: [],
			page_number: 1,
			pages: 1,
			result: 0
		};
		const length = limit;
		const data_list: any[] = [];
		//return boolean next, boolean prev,data to be served

		//calculate number of pages
		let pages = Math.floor(list.length / length);
		if ((list.length % length) > 0) {
			pages = pages + 1;
		}
		const beginIndex = length * (pageNumber - 1);
		const limitIndex = beginIndex + length;

		for (let a = beginIndex; a < limitIndex; a++) {
			if (list[a] === undefined) {
				break;
			} else {
				data_list.push(list[a]);
			}
		}
		//set total number of pages
		response.pages = pages;
		//set current page number
		response.page_number = pageNumber;
		//set current data table
		response.data = data_list;
		response.result = list.length;

		const prev_page = pageNumber - 1;
		const next_page = pageNumber + 1;

		//set next page info
		if (next_page <= pages && next_page > 0) {
			response.next.status = true;
			response.next.page = next_page;
		} else {
			response.next.status = false;
			response.next.page = 0;
		}
		//set prev page info
		if (prev_page <= pages && prev_page > 0) {
			response.prev.status = true;
			response.prev.page = prev_page;
		} else {
			response.prev.status = false;
			response.prev.page = 0;
		}
		return response;
	}

	filterGraduationStudents() {
		// console.warn("filterForm.stream", this.filterForm.stream);
		this.isLoading = true;

		this.printoutsService.getGraduatedStudentList(this.filterForm.stream).subscribe({
			next: (response: any) => {
				// console.warn('Res >>', response);
				response == null ? response = [] : "";
				this.isLoading = true;
				this.searchClicked = true;
				this.studentResult = response;
				this.paginate_results = this.paginate(this.studentResult, 1, this.data_limit_length);
			},
			error: err => {
				console.error(err);
				this.isLoading = false;
				this.responseHandlerService.error(err, "filterGraduationStudents()");
			},
			complete: () => {
				this.isLoading = false;
			}
		});
	}

	showDocument(student: any) {
		student.loading = true;
		this.selectedStudent = student;

		//hit the backend for information
		this.printoutsService.getGraduatedStudentInformation(student.userid).subscribe({
			next: response => {
				this.studentCertificate = response;
				this.studentCertificate.student.userid = student.userid;
				this.studentCertificate.parts = this.parts(this.studentCertificate.student.generalComments);
				this.studentCertificate.school = {
					principal: this.schoolProfile.principal,
					logo: environment.apiurl + "/groups/images/" + this.schoolProfile.logo,
					name: this.schoolProfile.name,
					address: this.schoolProfile.address
				};
				const s = this.studentCertificate.student;
				if (s.admissionNumber == null ||
					s.admissionDate == null ||
					s.enrollmentForm == null ||
					s.graduationDate == null ||
					s.graduationForm == null ||
					s.dateOfBirth == null ||
					s.generalComments == null || s.generalComments == undefined || s.generalComments == "" ||
					s.issueDate == null) {
					const error_array: any[] = [];
					if (s.admissionNumber == null) {
						error_array.push(this.translate.instant("printouts.leavingCerts.swal.admissionNumber"));
					}
					if (s.upiNumber == null) {
						this.studentCertificate.student.upiNumber = "";
					}
					if (s.admissionDate == null) {
						error_array.push(this.translate.instant("printouts.leavingCerts.swal.admissionDate"));

					}
					if (s.enrollmentForm == null) {
						error_array.push(this.translate.instant("printouts.leavingCerts.swal.enrollmentForm"));

					}
					if (s.graduationDate == null) {
						error_array.push(this.translate.instant("printouts.leavingCerts.swal.graduationDate"));
					}
					if (s.graduationForm == null) {
						error_array.push(this.translate.instant("printouts.leavingCerts.swal.graduationForm"));
					}
					if (s.dateOfBirth == null) {
						error_array.push(this.translate.instant("printouts.leavingCerts.swal.dateOfBirth"));
					}
					if (s.issueDate == null) {
						error_array.push(this.translate.instant("printouts.leavingCerts.swal.issueDate"));
					}
					if (s.generalComments == null || s.generalComments == undefined || s.generalComments == "") {
						error_array.push(this.translate.instant("printouts.leavingCerts.swal.generalComments"));
					}
					let error = "";
					for (let a = 0; a < error_array.length; a++) {
						error += `<li style="text-align: left;text-transform: capitalize;">${error_array[a]}</li>`;
					}
					const sms1 = this.translate.instant("printouts.leavingCerts.swal.sms1");
					const sms2 = this.translate.instant("printouts.leavingCerts.swal.sms2");
					// const sms = `The Following information is not provided <br><br><b><ul style='display:inline-block'>${error}</ul></b><br></br> Proceed to add The information?`;
					const sms = `${sms1} <br><br><b><ul style='display:inline-block'>${error}</ul></b><br></br> ${sms2}`;
					Swal.fire({
						title: this.translate.instant("printouts.leavingCerts.swal.title"),
						html: sms,
						icon: "error",
						showCancelButton: true,
						confirmButtonColor: "#43ab49",
						cancelButtonColor: "#ff562f",
						confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
						cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
					}).then((result) => {
						if (result.isConfirmed) {
							this.editStudent(this.studentCertificate.student);
						}
					});
				} else {
					this.showingDocument = true;
				}
				this.selectedStudent.loading = false;
			},
			error: error => {
				this.selectedStudent.loading = false;
				if (!this.schoolProfile?.principal) {
					const message = this.translate.instant("printouts.leavingCerts.toastMessages.showDocumentError");
					this.toastService.error(message);
				} else {
					this.responseHandlerService.error(error, "showDocument()");
				}
			}
		});
	}

	hideDocument(show = false) {
		this.showingDocument = show;
	}

	parts(description: any) {
		if (!description || description.length == 0) {
			this.studentCertificate.part_content = false;
			return [];
		} else {
			const commentsArray: any[] = [];

			let length = description.length;
			if (length > 400) {
				length = 400;
				description = description.substring(0, (length + 1));
			}
			
			// Students comments rows content
			const parts = Math.ceil(length / 105) + 1;
			let formattedLength = 0;
			for (let a = 0; a < parts; a++) {
				const trimmedString = BasicUtils.shorten(description.substring(formattedLength, description.length), 105);

				formattedLength += trimmedString.length;
				commentsArray.push(trimmedString);
			}
			this.studentCertificate.part_content = true;
			return commentsArray;
		}
		
	}

	editStudent(student: any) {
		this.router.navigate(["main/students/prof", student.userid]);
	}
}