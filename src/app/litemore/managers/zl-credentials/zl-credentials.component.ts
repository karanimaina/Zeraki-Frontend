import { Component, OnDestroy, OnInit } from "@angular/core";
import { AbstractControl, FormBuilder } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import * as Excel from "exceljs";
import * as fs from "file-saver";
import { Subscription } from "rxjs";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";

@Component({
	selector: "app-zl-credentials",
	templateUrl: "./zl-credentials.component.html",
	styleUrls: ["./zl-credentials.component.scss"]
})
export class ZlCredentialsComponent implements OnInit, OnDestroy {
	zlCredentialListSub!: Subscription;
	zlCredentialListLoading = false;
	zlCredentialList: any;
	dataSource: MatTableDataSource<any> = new MatTableDataSource();

	currentPage = 1;
	totalPages!: number;

	searchForm = this.fb.group({
		schoolName: [""],
	});

	get schoolName(): AbstractControl | null {
		return this.searchForm.get("schoolName");
	}

	constructor(
		private fb: FormBuilder,
		private litemoreService: LitemoreService,
		private toast: HotToastService,
		private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.retrieveZlCredentialList();
	}

	ngOnDestroy(): void {
		this.zlCredentialListSub?.unsubscribe();
	}

	retrievePageResults(page: number) {
		this.currentPage = page;
		this.submitSearchForm();
	}

	resetSearchForm() {
		this.searchForm.reset({ schoolName: "" });
		this.resetPagination();
		this.submitSearchForm();
	}

	resetPagination() {
		this.currentPage = 1;
	}

	submitSearchForm() {
		const form = this.searchForm;
		form.markAllAsTouched();
		if (form.invalid) return;

		const schoolName = form.value["schoolName"];

		this.retrieveZlCredentialList(schoolName);
	}

	retrieveZlCredentialList(schoolName = "", isReport = false) {
		if (isReport) {
			this.isGeneratingExcel = true;
		} else {
			this.zlCredentialListLoading = true;
		}

		let params = `?currentPage=${this.currentPage}&name=${schoolName}`;
		if (isReport) params = `?isReport=true&name=${schoolName}`;

		this.zlCredentialListSub = this.litemoreService.getZlearningCredentials(params).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				if (isReport) {
					this.generateExcel(resp.schools);
				}

				this.currentPage = resp.currentPage;
				this.totalPages = resp.totalPages;
				this.zlCredentialList = resp.schools || [];
				this.dataSource = new MatTableDataSource(this.zlCredentialList);
				this.zlCredentialListLoading = false;
			},
			error: err => {
				console.error(err);

				this.zlCredentialListLoading = false;
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
			}
		});
	}

	downloadExcel() {
		const schoolName = this.searchForm.value["schoolName"];
		this.retrieveZlCredentialList(schoolName, true);
	}

	isGeneratingExcel = false;

	async generateExcel(schools: any[]) {
		this.isGeneratingExcel = true;

		const currentDate = new Date();
		const hours = String(currentDate.getHours()).padStart(2, "0");
		const minutes = String(currentDate.getMinutes()).padStart(2, "0");

		// translations
		// const fileName = this.translate.instant("litemore.zlCreds.excelDownload.fileName");
		// TODO: how to mark for translation (i.e time localization)
		const fileName =this.translate.instant("litemore.managers.zlCredentials.fileName",{
			data:` ${currentDate.toDateString().substring(4)} ${hours}${minutes}`
		})
		// const fileName = `Zeraki Learning Credentials (as at ${currentDate.toDateString().substring(4)} ${hours}${minutes}hrs)`;
		const workSheetName = this.translate.instant("litemore.zlCreds.excelDownload.workSheetName");

		const schoolHeader = this.translate.instant("common.school");
		const registrationHeader = this.translate.instant("common.registration");
		const countyHeader = this.translate.instant("common.county");
		const regionHeader = this.translate.instant("common.region");
		const totalStudentsHeader = this.translate.instant("common.students");
		const sentCredsHeader = this.translate.instant("litemore.zlCreds.tableHeaders.sentCreds");

		const columns = [
			{ header: schoolHeader, key: "school" },
			{ header: registrationHeader, key: "registration" },
			{ header: countyHeader, key: "county" },
			{ header: regionHeader, key: "region" },
			{ header: totalStudentsHeader, key: "students" },
			{ header: sentCredsHeader, key: "sent_credentials" },
		];

		// create the excel document.
		const workbook = new Excel.Workbook();
		const worksheetSchools = workbook.addWorksheet(workSheetName);
		worksheetSchools.columns = [...columns];

		worksheetSchools.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};
		worksheetSchools.getRow(1).height = 20;

		// add school list content
		schools.forEach((school: any) => {
			worksheetSchools.addRow({
				school: school.schoolName,
				registration: school.registration,
				county: school.county,
				region: school.region,
				students: school.totalStudents,
				sent_credentials: school.sentCredentials
			});
		});

		worksheetSchools.columns.forEach((column: Partial<Excel.Column>) => {
			let dataMax = 0;

			column.eachCell!({ includeEmpty: true }, function (cell) {
				dataMax = cell.value ? cell.value.toString().length : 0;

				if (dataMax > column.width!) {
					column.width = dataMax + 2;
				}

				dataMax = 0;
			});
		});

		// save the workbook
		try {
			const data = await workbook.xlsx.writeBuffer();
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, fileName + ".xlsx");
			this.toast.success(this.translate.instant("common.toastMessages.excelDownloadSuccess"));
		} catch (error) {
			console.error(error);
			this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred2"));
		} finally {
			this.isGeneratingExcel = false;
		}

	}

}
