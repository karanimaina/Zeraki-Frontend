import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";
import * as Excel from "exceljs";
import * as fs from "file-saver";
import { Subject } from "rxjs";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import {
	UpdateSchoolPayload
} from "src/app/@core/models/litemore/school/payload";
import { finalize, takeUntil } from "rxjs/operators";
import { LitemoreInvoiceSchool } from "src/app/@core/models/litemore/school/litemore-school-data";
import { TranslateService } from "@ngx-translate/core";
import { County } from "src/app/@core/models/country/county/county";

@Component({
	selector: "app-list",
	templateUrl: "./list.component.html",
	styleUrls: ["./list.component.scss"]
})
export class ListComponent implements OnInit {
	destroy$: Subject<boolean> = new Subject<boolean>();
	schoolList?: LitemoreInvoiceSchool;
	loggedInUser?: LitemoreUser1;
	regionalCountyList: County[] = [];
	countyList: any = [];
	currentPage = 1;
	isLoadingSchools = false;
	urlParams = "";
	filterForm!: SubmitFormGroup;
	isGeneratingExcel = false;

	constructor(
		private bdevService: BdevService,
		private litemoreService: LitemoreService,
		private litemoreUserService: LitemoreUserService,
		private toastService: HotToastService,
		private router: Router,
		private responseHandlerService: ResponseHandlerService,
		private translate: TranslateService
	) { }

	ngOnInit(): void {
		this.loadLoggedInUser();
	}

	loadLoggedInUser() {
		this.litemoreUserService.litemoreUser$.subscribe((r) => {
			this.loggedInUser = this.litemoreUserService.initLitemoreUser(r);
		});
	}

	OloadSchoolList(params: string) {
		this.urlParams = params;
		this.loadSchoolList(params);
	}

	OFilterForm(form: any) {
		this.filterForm = form;
		console.warn("this.filterForm >> ", this.filterForm);
	}

	// This function just gets all the schools with params passed
	loadSchoolList(params: any) {
		this.isLoadingSchools = true;

		const url = `?currentPage=${this.currentPage}${params}`;

		this.bdevService
			.getSchoolProformas(url)
			.pipe(
				takeUntil(this.destroy$),
				finalize(() => (this.isLoadingSchools = false))
			)
			.subscribe({
				next: (response) => {
					this.schoolList = response;
				},
				error: (err: any) => {
					this.responseHandlerService.error(err, "loadSchoolList()");
				}
			});
	}

	prevClicked() {
		if (
			this.currentPage - 1 > 0 &&
			this.currentPage - 1 < (this.schoolList?.totalPages || 0)
		) {
			this.currentPage = this.currentPage - 1;
			this.loadSchoolList(this.urlParams);
		}
	}
	nextClicked() {
		if (this.currentPage + 1 <= (this.schoolList?.totalPages || 0)) {
			this.currentPage = this.currentPage + 1;
			this.loadSchoolList(this.urlParams);
		}
	}

	schoolListToExcel() {
		this.exportToExcel();
	}

	private get selectedInvoiceDayRange() {
		return this.getFilterFormValue("selectedInvoiceDayRange");
	}
	private get selectedProformaDayRange() {
		return this.getFilterFormValue("selectedProformaDayRange");
	}
	get selectedProduct() {
		return this.getFilterFormValue("selectedProduct");
	}
	get startDate() {
		return this.getFilterFormValue("startDate");
	}
	get endDate() {
		return this.getFilterFormValue("endDate");
	}

	private getFilterFormValue(formControlName: string) {
		return this.filterForm?.controls[formControlName]?.value;
	}

	exportToExcel() {
		let name = "School List Invoices ";

		if (
			!this.filterForm?.value?.checkArray?.includes("withInvoices") &&
			this.selectedInvoiceDayRange
		) {
			switch (this.selectedInvoiceDayRange) {
			case "0_15": {
				//today's date , today's date + 15
				const date_end = new Date(
					new Date().getTime() + 15 * 1000 * 60 * 60 * 24
				)
					.toDateString()
					.substring(4);
				const date_start = new Date().toDateString().substring(4);
				name += " from " + date_start + " to " + date_end;
				break;
			}
			case "15_45": {
				//today's date+15 , today's date + 45
				const date_end = new Date(
					new Date().getTime() + 45 * 1000 * 60 * 60 * 24
				)
					.toDateString()
					.substring(4);
				const date_start = new Date(
					new Date().getTime() + 15 * 1000 * 60 * 60 * 24
				)
					.toDateString()
					.substring(4);
				name += " from " + date_start + " to " + date_end;
				break;
			}
			case "45_": {
				//today's date + 45
				const date_start = new Date(
					new Date().getTime() + 45 * 1000 * 60 * 60 * 24
				)
					.toDateString()
					.substring(4);
				name += " from " + date_start;
				break;
			}
			default:
				break;
			}
		}

		if (
			!this.filterForm.value.checkArray.includes("withProformaInvoices") &&
			this.selectedProformaDayRange
		) {
			switch (this.selectedProformaDayRange) {
			case "0_15": {
				//today's date , today's date + 15
				const date_end = new Date(
					new Date().getTime() + 15 * 1000 * 60 * 60 * 24
				)
					.toDateString()
					.substring(4);
				const date_start = new Date().toDateString().substring(4);
				name += " from " + date_start + " to " + date_end;
				break;
			}
			case "15_45": {
				//today's date+15 , today's date + 45
				const date_end = new Date(
					new Date().getTime() + 45 * 1000 * 60 * 60 * 24
				)
					.toDateString()
					.substring(4);
				const date_start = new Date(
					new Date().getTime() + 15 * 1000 * 60 * 60 * 24
				)
					.toDateString()
					.substring(4);
				name += " from " + date_start + " to " + date_end;
				break;
			}
			case "45_": {
				//today's date + 45
				const date_start = new Date(
					new Date().getTime() + 45 * 1000 * 60 * 60 * 24
				)
					.toDateString()
					.substring(4);
				name += " from " + date_start;
				break;
			}
			default:
				break;
			}
		}

		const current_date = new Date();
		const hours = String(current_date.getHours()).padStart(2, "0");
		const minutes = String(current_date.getMinutes()).padStart(2, "0");

		name +=
			" (as at " +
			current_date.toDateString().substring(4) +
			" " +
			hours +
			minutes +
			"hrs" +
			")";
		this.generateExcel(`${this.urlParams}&isReport=true`, name);
	}

	generateExcel(params: string, excel_name: string) {
		this.isGeneratingExcel = true;

		const url = "?currentPage=1" + params;
		this.bdevService
			.getSchoolProformas(url)
			.pipe(takeUntil(this.destroy$))
			.subscribe(
				(response) => {
					//create the excel document.
					const workbook = new Excel.Workbook();

					//------------------------------------
					//  SECTION SCHOOL LIST SHEET
					//------------------------------------
					const school = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.school"
					);
					const registrationDate = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.registrationDate"
					);
					const county = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.county"
					);
					const accountManager = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.accountManager"
					);
					const contactPerson = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.contactPerson"
					);
					const contactPersonPhone = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.contactPersonPhone"
					);
					const registeredProducts = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.registeredProducts"
					);
					const proformaInvoices = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.proformaInvoices"
					);
					const invoices = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.invoices"
					);
					const collections = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.collection"
					);
					const vouchers = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.vouchers"
					);
					const balance = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.balance"
					);
					const finance = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.finance"
					);
					const invoiceDueIn = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.invoiceDueIn"
					);
					const proformaDueIn = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.proformaDueIn"
					);
					const miniStatements = this.translate.instant(
						"litemore.bdevs.invoices.list.excel.miniStatements"
					);

					const worksheetSchoolList = workbook.addWorksheet("School List");
					worksheetSchoolList.columns = [
						{ header: school, key: "school" },
						{ header: registrationDate, key: "registration_date" },
						{ header: county, key: "county" },
						{ header: accountManager, key: "account_manager" },
						{ header: contactPerson, key: "contact_person" },
						{ header: contactPersonPhone, key: "contact_person_phone" },
						{ header: registeredProducts, key: "registered_products" },
						{ header: proformaInvoices, key: "proforma_invoice" },
						{ header: invoices, key: "invoice" },
						{ header: collections, key: "collections" },
						{ header: vouchers, key: "vouchers" },
						{ header: balance, key: "school_balance" },
						{ header: invoiceDueIn, key: "invoice_due_date" },
						{ header: proformaDueIn, key: "proforma_due_date" }
					];
					worksheetSchoolList.getRow(1).font = {
						name: "Calibri",
						color: { argb: "000000" },
						bold: true
					};
					worksheetSchoolList.getRow(2).font = {
						name: "Calibri",
						color: { argb: "000000" },
						bold: true
					};
					worksheetSchoolList.getRow(1).height = 20;
					//format School List sheet
					worksheetSchoolList.mergeCells("A1:A2");
					worksheetSchoolList.mergeCells("B1:B2");
					worksheetSchoolList.mergeCells("C1:C2");
					worksheetSchoolList.mergeCells("D1:D2");
					worksheetSchoolList.mergeCells("E1:E2");
					worksheetSchoolList.mergeCells("F1:F2");
					worksheetSchoolList.mergeCells("G1:G2");

					worksheetSchoolList.mergeCells("L1:L2");
					worksheetSchoolList.mergeCells("M1:M2");
					worksheetSchoolList.mergeCells("N1:N2");

					worksheetSchoolList.getColumn("H").width = 18;
					worksheetSchoolList.getColumn("I").width = 9;
					worksheetSchoolList.mergeCells("H1:I1");

					worksheetSchoolList.getColumn("J").width = 18;
					worksheetSchoolList.getColumn("K").width = 9;
					worksheetSchoolList.mergeCells("J1:K1");

					worksheetSchoolList.getCell("H1").value = miniStatements;
					worksheetSchoolList.getCell("H2").value = proformaInvoices;

					worksheetSchoolList.getCell("I2").value = invoices;

					worksheetSchoolList.getCell("J1").value = finance;
					worksheetSchoolList.getCell("J2").value = collections;
					worksheetSchoolList.getCell("K2").value = vouchers;

					//add school list content
					for (let a = 0; a < response.schools.length; a++) {
						const school = response.schools[a];
						let registered_products: any = [];
						if (school.registeredProducts.hasFinance) {
							registered_products.push("ZFinance");
						}
						if (school.registeredProducts.hasTimeTable) {
							registered_products.push("ZTimeTable");
						}
						worksheetSchoolList.addRow({
							school: school.school.schoolName,
							registration_date: school.signUpDate,
							county: school.county,
							account_manager:
								school.relationshipManager && school.relationshipManager.name
									? school.relationshipManager.name
									: "",
							contact_person:
								school.contactPerson && school.contactPerson.name
									? school.contactPerson.name
									: "",
							contact_person_phone:
								school.contactPerson && school.contactPerson.phone
									? school.contactPerson.phone
									: "",
							registered_products: registered_products.join(","),
							proforma_invoice: school.miniStatement.proformaInvoices,
							invoice: school.miniStatement.invoices,
							collections: school?.financeUsage?.collections || 0,
							vouchers: school?.financeUsage?.vouchers || 0,
							school_balance: school.balance,
							invoice_due_date: school.dueInvoiceIn,
							proforma_due_date: school.dueProformaInvoiceIn
						});
						registered_products = [];
					}

					// autosizing column width
					worksheetSchoolList.columns.forEach(function (column, i) {
						let maxColWidth = 0;
						column["eachCell"]!({ includeEmpty: true }, function (cell) {
							const columnWidth = cell.value
								? cell.value.toString().length
								: 10;
							if (columnWidth > maxColWidth) {
								maxColWidth = columnWidth;
							}
						});
						column.width = maxColWidth < 10 ? 10 : maxColWidth;
					});

					//save the workbook
					workbook.xlsx.writeBuffer().then((data) => {
						const blob = new Blob([data], {
							type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
						});
						fs.saveAs(blob, excel_name + ".xlsx");
					});
				},
				(error) => {
					this.responseHandlerService.error(error, "generateExcel()");
				},
				() => (this.isGeneratingExcel = false)
			);
	}

	viewSchool(schoolId: number) {
		this.router.navigate(["/litemore/am/invoices", schoolId]);
	}

	//update tracking usage
	updateTrackingUsage(school: any, type, index) {
		const user = this.loggedInUser;
		const today = this.translate.instant(
			"litemore.bdevs.invoices.list.excel.today"
		);

		console.warn("USER >> ", user);
		this.bdevService
			.updateTrackingUsage(
				"?schoolId=" + school.school.schoolId + "&usageItem=" + type
			)
			.pipe(takeUntil(this.destroy$))
			.subscribe(
				(response) => {
					//update the current school content
					if (type == 1) {
						school.usageTracking.setup = today;
					}
					if (type == 2) {
						school.usageTracking.training = today;
					}
					this.schoolList!.schools[index] = school;
				},
				(error) => {
					this.toastService.warning(error.data.response.message);
				}
			);
	}

	//this logic is for editing the contact info
	initiateSchoolEdit(school, status) {
		school.edit = status;
		if (!status) {
			school.county_edit = false;
			school.contact_edit = false;
		}
	}
	initEditSchoolCounty(school: any) {
		school.county_temp = school.county;
		school.county_edit = true;
	}
	updateSchoolCounty(school: any) {
		let new_county_name = "";
		const payload: UpdateSchoolPayload = { schoolId: school.school.schoolId };

		const countyId = this.regionalCountyList.find(
			(county) => county.name === school.county_temp
		)?.countyId;

		if (school.county_temp && countyId) {
			payload.countyId = countyId;
			new_county_name = school.county_temp;
		}

		this.litemoreService
			.updateSchoolCounty(payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp: any) => {
					school.county = new_county_name;
					school.county_edit = false;

					const countyFilter =
						this.filterForm?.controls["selectedCounty"]?.value;
					if (countyFilter && payload.countyId !== countyFilter)
						this.removeSchoolFromList(school.schoolId);

					this.responseHandlerService.success(resp, "updateSchoolCounty()");
				},
				error: (err: any) => {
					this.responseHandlerService.error(err, "updateSchoolCounty()");
				}
			});
	}

	private removeSchoolFromList(schoolId: number) {
		const foundSchoolIndex = this.schoolList?.schools.findIndex(
			(school: any) => school.schoolId === schoolId
		);
		if (foundSchoolIndex !== -1)
			this.schoolList?.schools.splice(foundSchoolIndex!, 1);
	}

	initiateContactPersonEdit(s, status) {
		s.contact_edit = status;
		if (status) {
			s.contact_person_name_temp = s.contactPerson.name;
			s.contact_person_phone_temp = s.contactPerson.phone;
		}
	}
	updateContactPerson(s) {
		if (
			s != null &&
			s.contact_person_name_temp != null &&
			s.contact_person_name_temp.length > 0 &&
			s.contact_person_phone_temp != null &&
			s.contact_person_phone_temp.length > 0
		) {
			const payload: UpdateSchoolPayload = {
				schoolId: parseInt(s.school.schoolId),
				contactPersonName: s.contact_person_name_temp,
				contactPersonPhone: s.contact_person_phone_temp
			};

			this.litemoreService
				.updateSchoolContactPerson(payload)
				.pipe(takeUntil(this.destroy$))
				.subscribe({
					next: (resp: any) => {
						s.contactPerson.name = s.contact_person_name_temp;
						s.contactPerson.phone = s.contact_person_phone_temp;
						s.contact_edit = false;

						this.responseHandlerService.success(resp, "updateContactPerson()");
					},
					error: (err: any) => {
						this.responseHandlerService.error(err, "updateContactPerson()");
					}
				});
		}
	}

	ORegionalCountyList(counties: any) {
		this.regionalCountyList = counties;
		// console.warn("new regionalCountyList gotten>> ", this.regionalCountyList);
	}

	OCountyList(counties: any) {
		this.countyList = counties;
	}
}
