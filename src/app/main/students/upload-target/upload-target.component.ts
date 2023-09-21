import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
// import * as moment from 'moment';
import { Subscription } from "rxjs";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";

@Component({
	selector: "app-upload-target",
	templateUrl: "./upload-target.component.html",
	styleUrls: ["./upload-target.component.scss"]
})
export class UploadTargetComponent implements OnInit, OnDestroy {
	isFileSelected = false;
	data: any[] = [];
	subjectsSub?: Subscription;
	subjectsObj: any;

	showSheet = false;
	subject_textcodes:any[] = [];
	// headers_template = ["ADMNO", "NAME"];
	headers_template: string[] = [];
	allowed_headers: any[] = [];
	error_exam = false;
	error_msg = "";
	custom_errors: any[] = [];
	rightSidebar = false;
	student_data: any[] = [];
	sheet_headers: any[] = [];
	resultsLimit = 0;
	showMoreButton = false;
	showLoading = false;
	only_missing_streams = false;
	file_input: any;

	constructor(
    private classesService: ClassesService,
    private dataService: DataService,
    private toastService: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnDestroy(): void {
		this.subjectsSub?.unsubscribe();
	}

	ngOnInit(): void {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admno" },
			{ key: "name" },
		];

		// generate translated excel columns
		const columns: any[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`students.up_target.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);
			return columnHeaderName.toUpperCase();
		});

		this.headers_template = [...columns];

		this.getSubjectsData();

		const admissionNumberColName: string = this.translate.instant("students.up_target.excelTemplateDownload.workSheetColumnHeaders.admno");
		const admissionNumberColNameMeaning: string = this.translate.instant("students.up_target.excelTemplateDownload.workSheetColumnHeaders.admnoMeaning");
		const nameColName: string = this.translate.instant("students.up_target.excelTemplateDownload.workSheetColumnHeaders.name");
		const nameColNameMeaning: string = this.translate.instant("students.up_target.excelTemplateDownload.workSheetColumnHeaders.nameMeaning");

		this.allowed_headers.push({column: admissionNumberColName.toUpperCase(), meaning: admissionNumberColNameMeaning});
		this.allowed_headers.push({column: nameColName.toUpperCase(), meaning: nameColNameMeaning});
	}

	initBoolean() {
		this.error_exam = false;
		this.error_msg = "";
		this.custom_errors = [];
		this.rightSidebar = false;
	}

	uploadAnother() {
		this.initBoolean();
		this.data = [];
	}

	getSubjectsData() {
		this.subjectsSub = this.classesService.getSubjects().subscribe(val => {
			// console.warn("getSchoolTypeData >> ", val);
			this.subjectsObj = val;

			this.subjectsObj.subjects.forEach((subject: any) => {
				this.subject_textcodes.push(subject.textCode);
				this.headers_template.push(subject.textCode);
				this.allowed_headers.push({column: subject.textCode, meaning: subject.name});
			});
		});
	}

	detectFiles(event: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);
		target.files.length == 1? this.isFileSelected = true: this.isFileSelected = false;
		if (target.files.length !== 1) throw new Error("Cannot use multiple files");
		const reader: FileReader = new FileReader();
		reader.onload = (e: any) => {
			this.initBoolean();
			/* read workbook */
			const ab: ArrayBuffer = e.target.result;
			const wb: XLSX.WorkBook = XLSX.read(ab);

			/* grab first sheet */
			const wsname: string = wb.SheetNames[0];
			const ws: XLSX.WorkSheet = wb.Sheets[wsname];

			/* save data */
			this.data = XLSX.utils.sheet_to_json(ws, {header: 1});
			this.sheet_headers = this.data[0];
			this.data.splice(0,1);

			this.showMore();

			const merged: any = [];
			this.data.forEach((row) => {
				const res: any = {};
				for (let index = 0; index < this.headers_template.length; ++index) {
					res[this.headers_template[index].toLocaleLowerCase()] = row[index];
				}
				merged.push(res);
				// console.warn(`merged ${index} >> `, res);
			});

			// console.warn("merged TOTAL>> ", merged);

			this.student_data = merged;
		};
		reader.readAsArrayBuffer(target.files[0]);
	}

	downloadExcelTemplate() {
		// translations
		const fileName = this.translate.instant("students.up_target.excelTemplateDownload.fileName");
		const workSheetName = this.translate.instant("students.up_target.excelTemplateDownload.workSheetName");

		this.dataService.downloadExcelTemplate(this.headers_template, fileName, workSheetName);
	}

	showMore() {
		this.resultsLimit += 50;
		if (this.resultsLimit > this.student_data.length) {
			this.resultsLimit = this.student_data.length;
		}
		if (this.student_data.length > 0 && this.resultsLimit < this.student_data.length) {
			this.showMoreButton = true;
		} else {
			this.showMoreButton = false;
		}
	}

	doUploadGrades(form: NgForm) {
		this.initBoolean();
		this.showLoading = true;
		let listOfAdms: any[] = [];
		let has_header_error = false;
		let header_error_text = "The uploaded document contains the following forbidden columns: ";
		const header_error: any = {msg: [], allowed_headers: []};
		header_error.title = "Forbidden Columns";
		this.sheet_headers.forEach(sh => {
			let header_exists = false;
			this.headers_template.forEach(ht => {
				if (sh.trim().toLowerCase() == ht.trim().toLowerCase()) {
					header_exists = true;
				}
			});
			if (!header_exists) {
				if (has_header_error) {
					header_error_text += ", " + sh;
				} else {
					header_error_text += sh;
				}
				has_header_error = true;
			}
		});

		if (has_header_error) {
			header_error.msg.push(header_error_text);
			header_error.allowed_headers = this.allowed_headers;
			this.custom_errors.push(header_error);
			this.rightSidebar = true;
			this.showLoading = false;
		} else {
			this.student_data.forEach((dt, i) => {
				const error: any = {msg: []};
				let identification = (i + 1) as unknown as string;
				if (dt.name !== undefined) {
					identification = identification + " (" + dt.name + ")";
				}

				this.subjectsObj.subjects.forEach((subject: any) => {
					const subject_marks = dt[subject.textCode];
					if (subject_marks !== undefined && subject_marks !== null) {
						if (subject_marks.length !== undefined && !(subject_marks.length > 0)) {
							delete dt[subject.textCode];
						} else if (subject_marks < 0 || subject_marks > 100) {
							const msg = "Has invalid " + subject.name + " marks";
							if (error.title === undefined) {
								error.title = "Student " + identification;
							}
							error.msg.push(msg);
							this.only_missing_streams = false;
						}
					}
					if (subject_marks === null) {
						delete dt[subject.textCode];
					}
				});

				if (dt.admno === undefined || dt.admno === null || dt.admno.toString().trim().length === 0) {
					const msg = "Does not have an ADMISSION NUMBER";
					if (error.title === undefined) {
						error.title = "Student " + identification;
					}
					error.msg.push(msg);
					this.only_missing_streams = false;
				} else {
					dt.admno = dt.admno.toString().trim();

					this.student_data.forEach((s, j) => {
						if (j !== i && s.admno !== undefined && s.admno !== null && s.admno.trim().length > 0) {
							s.admno = s.admno.trim();
							if (dt.admno === s.admno) {
								const msg = "Admission Number is the same as that of student " + (j + 1);
								if (error.title === undefined) {
									error.title = "Student " + identification;
								}
								error.msg.push(msg);
								this.only_missing_streams = false;
							}
						}
					});
				}

				if (error.title !== undefined && error.msg.length > 0) {
					this.custom_errors.push(error);
				}
			});

			if (this.custom_errors.length > 0) {
				this.rightSidebar = true;
				this.showLoading = false;
			} else {
				Swal.fire({
					title: this.translate.instant("students.up_target.swal.title"),
					text: this.translate.instant("students.up_target.swal.text"),
					icon: "question",
					showCancelButton: true,
					confirmButtonColor: "#43ab49",
					cancelButtonColor: "#ff562f",
					confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed")
				}).then((result) => {
					if (result.isConfirmed) {
						// get the strings only
						this.student_data.forEach(dt => {
							const dt_temp = JSON.parse(JSON.stringify(dt));
							delete dt_temp.name;
							const lowercase_dt = this.keysToLowerCase(dt_temp);
							listOfAdms.push(lowercase_dt);
						});
						// console.warn("student_data", student_data);
						this.dataService.send(this.student_data, "groups/school/students/targetgrades")
							.subscribe({
								next: data => {
									this.showLoading = false;
									const responseData: any = data;
									// console.warn("DATA >> ", responseData);
									if (responseData.responseCode == 200) {
										const message = responseData.message;
										listOfAdms = [];
										this.data = [];
										this.isFileSelected = false;
										Swal.fire(
											this.translate.instant("students.up_target.swal.title2"),
											`${message}`,
											"success"
										);
										form.resetForm(); // or form.reset();
									}
								},
								error: error => {
									// this.errorMessage = error.message;
									this.showLoading = false;
									if (error.status == 422) {
										this.custom_errors = error.data;
										this.rightSidebar = true;
									}
									console.error("There was an error!", error);
									const message = this.translate.instant("common.toastMessages.anErrorOccurred2");
									this.toastService.error(message);
								}
							});
					}
				});
			}
		}

	}

	keysToLowerCase(obj: any) {
		if (typeof (obj) === "string" || typeof (obj) === "number" || typeof (obj) === "boolean") {
			return obj;
		}
		const keys = Object.keys(obj);
		let n = keys.length;
		let lowKey;
		while (n--) {
			const key = keys[n];
			if (key === (lowKey = key.toLowerCase()))
				continue;
			obj[lowKey] = this.keysToLowerCase(obj[key]);
			delete obj[key];
		}
		return (obj);
	}

}
