import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { UserInit } from "src/app/@core/models/user_init";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import Swal from "sweetalert2";
import { TranslateService } from "@ngx-translate/core";
import { InvoiceUpdatePayload } from "../models/invoice-update";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { CollectionPayload } from "../models/colecction";

@Component({
	selector: "app-view-school",
	templateUrl: "./proforma.component.html",
	styleUrls: ["./proforma.component.scss"]
})
export class ProformaComponent implements OnInit, OnDestroy {
	destroy$ = new Subject<boolean>();

	loggedInUser?: LitemoreUser1;
	userInit!: UserInit;
	routeParams: any;
	schoolInfo!: LitemoreSchoolProfile;
	schoolProfomas: any;
	profomaCurrentPage = 1;
	profomaNumberSelect: any;
	isSendReminder = false;

	isInvoiceTable = true;
	isCreateProforma = false;
	isUpdateInvoice = false;
	isShowProformaDocument = false;
	isShowOldInvoice = false;

	selected_profoma: any = null;
	dueDate = null;

	current_old_invoice: any = null;
	isCollectOldInvoice = false;
	collection_amount = "";
	collection_method = "";
	collection_date = "";
	selected_collection: any = null;
	isEditCollection = false;
	postSms: any;

	newSelectedProforma: any;

	constructor(
		private route: ActivatedRoute,
		private bdevService: BdevService,
		private invoiceService: InvoiceService,
		private litemoreUserService: LitemoreUserService,
		private dataService: DataService,
		private toastService: HotToastService,
		private responseHandler: ResponseHandlerService,
		private router: Router,
		private translate: TranslateService
	) {}

	ngOnInit(): void {
		this.loadLoggedInUser();
		this.loadUserInit();
		this.invoiceService.setInvoiceVoteHeads();
		this.route.params.subscribe((p) => {
			this.routeParams = p;
			this.loadSchoolInfo(p.school_id);
			this.loadSchoolProformas(p.school_id);
		});
		this.initApp();
	}
	loadLoggedInUser() {
		this.litemoreUserService.litemoreUser$.subscribe((r) => {
			this.loggedInUser = r;
		});
	}
	loadUserInit() {
		this.dataService.userInitSubject.subscribe((r) => {
			this.userInit = r;
		});
	}

	loadSchoolInfo(school_id: any) {
		this.bdevService.loadSchoolInfo(school_id).subscribe(
			(r) => {
				this.schoolInfo = r;
			},
			(e) => {
				//console.log(e);
			}
		);
	}

	loadSchoolProformas(schoolId: number) {
		this.invoiceService
			.getSchoolProformas(schoolId, `currentPage=${this.profomaCurrentPage}`)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (resp) => this.schoolProfomas = resp,
				error: (err) => this.responseHandler.error(err, "loadSchoolProformas()"),
			});
	}

	//delete proforma invoice
	deleteProformaInvoice(proformaInvoice: any) {
		const title = this.translate.instant("litemore.bdevs.invoices.swal.title");
		const text = this.translate.instant("litemore.bdevs.invoices.swal.text");
		Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.bdevs.invoices.swal.yes"
			),
			cancelButtonText: this.translate.instant(
				"litemore.bdevs.invoices.swal.no"
			)
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				const url = "/invoice/proforma/" + proformaInvoice.proformaId;
				this.bdevService.doDelete(url).subscribe(
					(resp) => {
						this.reloadSchoolInfo();
						//reload the proforma invoices
						this.toastService.success(
							this.translate.instant("litemore.bdevs.invoices.deleteSuccess")
						);
						this.loadSchoolProformas(this.routeParams.school_id);
					},
					(error) => {
						this.responseHandler.error(error, "deleteProformaInvoice()");
					}
				);
			}
		});
	}

	profomaPrevClicked() {
		if (
			this.profomaCurrentPage - 1 > 0 &&
			this.profomaCurrentPage - 1 < this.schoolProfomas.totalPages
		) {
			this.profomaCurrentPage = this.profomaCurrentPage - 1;
			this.reloadProfomaInvoices(this.profomaCurrentPage);
		}
	}
	profomaNextClicked() {
		if (this.profomaCurrentPage + 1 <= this.schoolProfomas.totalPages) {
			this.profomaCurrentPage = this.profomaCurrentPage + 1;
			this.reloadProfomaInvoices(this.profomaCurrentPage);
		}
	}
	//reload school Information
	reloadSchoolInfo() {
		this.loadSchoolInfo(this.routeParams.school_id);
	}

	//view invoices
	viewInvoices(event) {
		console.log(event);
		// event = proformaId, profomaNumber, isProformaInvoice
		this.profomaNumberSelect = event.profomaNumber;
		this.router.navigate(
			[
				"../",
				this.routeParams.school_id,
				event.proformaItemId,
				event.isProformaInvoice
			],
			{ relativeTo: this.route }
		);
	}

	proforma_invoices: any;
	initApp() {
		this.proforma_invoices = "proforma_invoices " + this.routeParams.school_id;
	}

	//show the list of invoices
	showProformaTable() {
		this.isInvoiceTable = true;
		this.isCreateProforma = false;
		this.isUpdateInvoice = false;
		this.isSendReminder = false;
		this.isShowProformaDocument = false;
		this.isShowOldInvoice = false;
	}

	//Toggle between create invoice and table list
	showCreateInvoice() {
		this.isInvoiceTable = false;
		this.isCreateProforma = true;
		this.isUpdateInvoice = false;
		this.isSendReminder = false;
		this.isShowProformaDocument = false;
		this.isShowOldInvoice = false;
	}

	//toggle between table and view proforma
	showProformaPrint(proforma) {
		console.warn("proforma >> ", proforma);
		this.isInvoiceTable = false;
		this.isCreateProforma = false;
		this.isUpdateInvoice = false;
		this.isSendReminder = false;
		this.isShowProformaDocument = true;
		this.isShowOldInvoice = false;
		this.newSelectedProforma = proforma;
	}

	initProformaEdit(proforma: any) {
		this.newSelectedProforma = proforma;
		this.isInvoiceTable = false;
		this.isCreateProforma = false;
		this.isUpdateInvoice = true;
		this.isSendReminder = false;
		this.isShowProformaDocument = false;
		this.isShowOldInvoice = false;
	}

	//post update gross
	isUpdatingProformaInvoice = false;
	updateProformaInvoiceAmount(proforma) {
		console.log("Obtained ==>", this.isUpdatingProformaInvoice);
		//check for user rights
		//only cx and bdevManager and schoolRegionalManger
		if (
			[LitemoreUserRole.LITEMORE_ADMIN, LitemoreUserRole.BDEV_MANAGER].some(
				(role) => this.loggedInUser?.litemoreRoles.includes(role)
			)
		) {
			const d = proforma.updatedOn.slice("/");
			const postUpdateProforma: any = {
				proformaId: proforma.proformaId,
				schoolId: this.routeParams.school_id,
				proformaItemId: proforma.proformaItemId,
				grossAmount: proforma.gross_amount_temp
			};

			this.isUpdatingProformaInvoice = true;
			console.log("Obtained ==>", this.isUpdatingProformaInvoice);
			this.bdevService
				.doPutWithParams("/invoice/proforma", postUpdateProforma)
				.subscribe(
					(response) => {
						if (response.response.title === "Success") {
							this.toastService.success(response.response.message);
							//update the invoice amount
							proforma.grossAmount = proforma.gross_amount_temp;
							proforma.editingAmount = false;
						} else {
							this.toastService.warning(response.response.message);
						}
						this.isUpdatingProformaInvoice = false;
					},
					(error) => {
						// console.log(error)
						this.responseHandler.error(error, "updateProformaInvoiceAmount()");
						this.isUpdatingProformaInvoice = false;
					}
				);
		} else {
			this.toastService.warning(
				this.translate.instant(
					"litemore.bdevs.invoices.notAuthorisedToEditResource"
				)
			);
		}
	}

	initiateProformaInvoiceExtensionDate(proforma) {
		if (proforma.extensionDate !== null && proforma.extensionDate !== "") {
			const d = proforma.extensionDate.split("/");
			//month - day- year
			/**
			 * d=>[day,month,year]
			 */
			// proforma.extension_date_temp = new Date(d[1] + "-" + d[0] + "-" + d[2]);
			proforma.extension_date_temp = d[2] + "-" + d[1] + "-" + d[0];
			// proforma.extension_date_temp = Date.parse(new Date(d[1] + "-" + d[0] + "-" + d[2]).toDateString());
		} else {
			proforma.extension_date_temp = "";
		}
		proforma.editingExtensionDate = true;
	}

	isUpdatingProformaExtensionDate = false;
	updateProformaExtensionDate(proforma) {
		const d = new Date(proforma.extension_date_temp);
		//format the date
		let day: any = d.getDate();
		if (day < 10) {
			day = "0" + day;
		}
		let month: any = d.getMonth() + 1;
		if (month < 10) {
			month = "0" + month;
		}
		const year = d.getFullYear();
		const formatedDate = day + "/" + month + "/" + year;
		if (
			[LitemoreUserRole.LITEMORE_ADMIN, LitemoreUserRole.BDEV_MANAGER].some(
				(role) => this.loggedInUser?.litemoreRoles.includes(role)
			)
		) {
			// const d = formatedDate.slice("/");
			const postUpdateProforma = {
				proformaId: proforma.proformaId,
				schoolId: this.routeParams.school_id,
				extensionDate: Date.parse(proforma.extension_date_temp)
			};

			this.isUpdatingProformaExtensionDate = true;
			this.bdevService
				.doPutWithParams("/invoice/proforma", postUpdateProforma)
				.subscribe(
					(response) => {
						this.isUpdatingProformaExtensionDate = false;
						if (response.response.title === "Success") {
							this.toastService.success(response.response.message);
							//update the invoice amount
							proforma.extensionDate = formatedDate;
						} else {
							this.isUpdatingProformaExtensionDate = false;
							this.toastService.warning(response.response.message);
						}
					},
					(error) => {
						// console.log(error)
						this.isUpdatingProformaExtensionDate = false;
						if (error?.error?.response?.message) {
							this.toastService.warning(error.error.response.message);
						} else {
							this.toastService.warning(
								this.translate.instant(
									"litemore.bdevs.invoices.couldNotPerformAction"
								)
							);
						}
					}
				);
		} else {
			this.isUpdatingProformaExtensionDate = false;
			this.toastService.warning(
				this.translate.instant(
					"litemore.bdevs.invoices.notAuthorisedToEditResource"
				)
			);
		}
	}

	addDaysToDate(date, days) {
		const result = new Date(date);
		result.setDate(result.getDate() + days);
		return result;
	}

	SubtractDatesAsDays(date_start, date_end) {
		return (date_end - date_start) / (1000 * 60 * 60 * 24);
	}

	sms_template = "";
	sms_to_principal = true;
	sms_to_relationship_manager = false;
	sms_to_contact_person = false;
	//toggle between reminder and table list
	//

	showUpdatePInvoice(profoma) {
		this.isInvoiceTable = false;
		this.isCreateProforma = false;
		this.isUpdateInvoice = false;
		this.isSendReminder = true;
		this.selected_profoma = profoma;
		this.sms_template = this.translate.instant(
			"litemore.bdevs.invoices.smsTemplate",
			{
				schoolName: this.schoolInfo.school.schoolName,
				amount: (this.selected_profoma.balance || 0).toFixed(2),
				daysLeft: this.selected_profoma.daysLeft,
				managerName: this.schoolInfo.relationshipManager.name,
				managerPhone: this.schoolInfo.relationshipManager.phone,
				customerCareNumber: this.schoolInfo.customer_care_number
			}
		);
	}

	sendSmsReminder(form: NgForm) {
		if (
			this.sms_to_principal ||
			this.sms_to_relationship_manager ||
			this.sms_to_contact_person
		) {
			const postSms: any = {
				schoolId: this.routeParams.school_id,
				sms: form.value.sms_template,
				sendToPrincipal: form.value.sms_to_principal,
				sendToRelationshipManager: form.value.sms_to_relationship_manager,
				sendToContactPerson: form.value.sms_to_contact_person
			};
			if (this.selected_profoma.proformaId !== undefined) {
				postSms.proformaId = this.selected_profoma.proformaId;
			} else {
				postSms.invoiceId = this.selected_profoma.invoiceId;
			}

			//do something
			////////console.log(this.postSms);

			//do a post request here!
			this.bdevService.doPostWithParams("/invoice/reminder", postSms).subscribe(
				(response) => {
					this.showProformaTable();
					let response_message = "";
					let user_not_found_error = "";
					let invalid_sms_recipient = "";
					response_message =
						"<b>" +
						response.response.title +
						"</b><br>" +
						response.response.message;

					if (response.usersNotFound !== undefined) {
						let list = "<ol>";
						for (let a = 0; a < response.usersNotFound.length; a++) {
							list += "<li>" + response.usersNotFound[a] + "</li>";
						}
						list += "</ol>";
						user_not_found_error = list;
					}
					if (response.invalidSmsRecipients !== undefined) {
						let list = "<hr><ol>";
						for (let a = 0; a < response.invalidSmsRecipients.length; a++) {
							list +=
								"<li><b>" +
								response.invalidSmsRecipients[a].recipient +
								"</b> : " +
								response.invalidSmsRecipients[a].reason +
								"</li>";
						}
						list += "</ol>";
						invalid_sms_recipient = list;
					}
					response_message += user_not_found_error + invalid_sms_recipient;
					this.toastService.success(response_message);
				},
				(error) => {
					this.responseHandler.error(error, "sendSmsReminder()");
				}
			);
		} else {
			this.toastService.warning(
				this.translate.instant("litemore.bdevs.invoices.selectOneRecipient")
			);
		}
	}

	//Create Proforma Invoice
	gross_amount?: number;
	gross_amount_fys: any = 0;
	gross_amount_setup = 0;
	profoma_due_date = "";
	profoma_due_date_fys = "";
	profoma_due_date_setup = "";
	votehead: any = "";

	createProformaSuccess() {
		this.reloadProfomaInvoices();
		this.reloadSchoolInfo();
	}

	reloadProfomaInvoices(currentPage = 1) {
		this.bdevService
			.getSpecificSchoolProformas(
				this.routeParams.school_id,
				"?currentPage=" + currentPage
			)
			.subscribe(
				(response) => {
					this.schoolProfomas = response;
					this.showProformaTable();
				},
				(error) => {
					this.responseHandler.error(error, "reloadProfomaInvoices()");
				}
			);
	}

	currentPage = 1;
	prevClicked() {
		if (
			this.currentPage - 1 > 0 &&
			this.currentPage - 1 < this.proforma_invoices.totalPages
		) {
			// if ((this.currentPage - 1) > 0 && ((this.currentPage - 1) < this.invoices.totalPages)) {
			this.currentPage = this.profomaCurrentPage - 1;
			this.reloadProfomaInvoices(this.profomaCurrentPage);
		}
	}

	nextClicked() {
		// if ((this.currentPage + 1) <= this.invoices.totalPages) {
		if (this.currentPage + 1 <= this.proforma_invoices.totalPages) {
			this.currentPage = this.currentPage + 1;
			this.reloadProfomaInvoices(this.currentPage);
		}
	}

	/**
	 * OLD INVOICE METHODS. To be deleted on obsoletion
	 */

	//toggle between table and view old invoice
	showOldInvoicePrint(proforma: any) {
		this.isInvoiceTable = false;
		this.isCreateProforma = false;
		this.isUpdateInvoice = false;
		this.isSendReminder = false;
		this.isShowProformaDocument = false;
		this.isShowOldInvoice = true;
		this.selected_profoma = proforma;
		this.selected_profoma.isProformaInvoice = false;
		this.loadOldInvoice_Collections();
	}

	//initiate Edit old invoice
	editOldInvoice(event: any) {
		// //console.log(event);
		// oldInvoice, status
		const oldInvoice = event.invoice;
		const status = event.status;
		oldInvoice.edit = status;
		if (!status) {
			oldInvoice.editExtensionDate = false;
			oldInvoice.editGrossAmount = false;
		}
	}
	//initiate extensiondate old invoice
	initEditExtensionDate(event: any) {
		// oldInvoice, status
		const oldInvoice = event.invoice;
		const status = event.status;

		oldInvoice.editExtensionDate = status;
		oldInvoice.extension_date_temp = oldInvoice.extensionDate;
		if (oldInvoice.extensionDate !== null) {
			//splice the date
			const d = oldInvoice.extensionDate.split("/");
			//month - day- year
			oldInvoice.extension_date_temp = d[2] + "-" + d[1] + "-" + d[0];
		}
	}

	// initiate gross amount old invoice
	initEditGrossAmount({ invoice: oldInvoice, status }: any) {
		oldInvoice.editGrossAmount = status;
		oldInvoice.gross_amount_temp = oldInvoice.grossAmount;
	}

	//update old invoice extension date
	updateOldInvoiceDate(oldInvoice) {
		const d = new Date(oldInvoice.extension_date_temp);
		//format the date
		let day: any = d.getDate();
		if (day < 10) {
			day = "0" + day;
		}
		let month: any = d.getMonth() + 1;
		if (month < 10) {
			month = "0" + month;
		}
		const year = d.getFullYear();
		const extensionDate = day + "/" + month + "/" + year;

		const payload: InvoiceUpdatePayload = {
			schoolId: +this.routeParams.school_id,
			invoiceId: oldInvoice.invoiceId,
			extensionDate,
		};

		this.invoiceService
			.updateInvoice(payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					this.responseHandler.success(response);
					oldInvoice.extensionDate = extensionDate;
					oldInvoice.editExtensionDate = false;
				},
				error: (error) => this.responseHandler.error(error, "updateOldInvoiceDate()"),
			});
	}

	// update old invoice amount
	updateOldInvoiceAmount(oldInvoice) {
		const payload: InvoiceUpdatePayload = {
			schoolId: +this.routeParams.school_id,
			invoiceId: oldInvoice.invoiceId,
			amount: oldInvoice.gross_amount_temp,
		};

		this.invoiceService
			.updateInvoice(payload)
			.pipe(takeUntil(this.destroy$))
			.subscribe({
				next: (response) => {
					this.responseHandler.success(response);

					oldInvoice.amountRemaining = oldInvoice.amountRemaining + (oldInvoice.gross_amount_temp - oldInvoice.grossAmount);
					oldInvoice.grossAmount = payload.amount;
					oldInvoice.editGrossAmount = false;
				},
				error: (error) => this.responseHandler.error(error, "updateOldInvoiceAmount()"),
			});
	}

	makeCollectionOldInvoice(oldInvoice) {
		this.current_old_invoice = oldInvoice;
		this.isCollectOldInvoice = true;
	}
	closeCollectOldInvoice() {
		this.current_old_invoice = null;
		this.isCollectOldInvoice = false;
	}

	//Record the collection here!
	recordCollection(event: any) {
		const cdate: any = event.collection_date; // $('#collection_date').val()
		const d = new Date(cdate);
		//format the date
		let day: any = d.getDate();
		if (day < 10) {
			day = "0" + day;
		}
		let month: any = d.getMonth() + 1;
		if (month < 10) {
			month = "0" + month;
		}
		const year = d.getFullYear();
		const date = `${year}-${month}-${day}`;

		const collectionPayload: CollectionPayload = {
			invoiceId: this.current_old_invoice.invoiceId,
			schoolId: this.routeParams.school_id,
			amount: event.collection_amount,
			additionalInfo: event.collection_method,
			collectionDate: Date.parse(date),
			useSchoolBalance: false,
		};

		this.invoiceService.addCollection(collectionPayload).subscribe({
			next: (response) => {
				this.reloadSchoolInfo();
				//reload old invoices once more
				this.loadSchoolProformas(this.routeParams.school_id);
				this.responseHandler.success(response);
			},
			error: (err) => this.responseHandler.error(err, "recordCollection()"),
			complete: () => this.closeCollectOldInvoice(),
		});
	}

	loadOldInvoice_Collections() {
		this.bdevService
			.getInvoiceCollections(this.selected_profoma.invoiceId)
			.subscribe(
				(response) => {
					this.selected_profoma.collections = response.collections;
				},
				(error) => {
					this.responseHandler.error(error, "loadOldInvoice_Collections()");
				}
			);

		this.bdevService.getInvoiceItems(this.selected_profoma.invoiceId).subscribe(
			(response) => {
				console.warn("response.items >> ", response);
				this.selected_profoma.items = response.items;
			},
			(error) => {
				this.responseHandler.error(error, "loadOldInvoice_Collections()");
			}
		);
	}

	listCollections = false;
	toggleCollectionView() {
		this.listCollections = !this.listCollections;
	}

	updateCollectionDate(form: NgForm, collection: any) {
		if (form.invalid) {
			return;
		}
		const d = new Date(this.selected_collection.collectionDateTemp);
		//format the date
		let day: any = d.getDate();
		if (day < 10) {
			day = "0" + day;
		}
		let month: any = d.getMonth() + 1;
		if (month < 10) {
			month = "0" + month;
		}
		const year: any = d.getFullYear();
		const formatedDate = day + "/" + month + "/" + year;
		const update_collection = {
			schoolid: this.routeParams.school_id,
			invoiceid: this.selected_profoma.invoiceId,
			update_invoice_collection: {
				collectionid: collection.collectionId,
				amount: collection.amount,
				date: formatedDate,
				additional_info: collection.additionalInfo,
				remove: false
			}
		};
		const url = "/groups/invoice/update";

		this.bdevService.doPostWithParams(url, update_collection).subscribe(
			(response) => {
				//if editing date
				collection.collectionDate = formatedDate;
				collection.editingCollectionDate = false;
				this.responseHandler.success(response);
			},
			(error) => {
				this.responseHandler.error(error, "updateCollectionDate()");
			}
		);
	}

	updateCollectionAdditionalInfo(form: NgForm, collection: any) {
		if (form.invalid) {
			return;
		}
		const update_collection = {
			schoolid: this.routeParams.school_id,
			invoiceid: this.selected_profoma.invoiceId,
			update_invoice_collection: {
				collectionid: collection.collectionId,
				amount: collection.amount,
				date: collection.collectionDate,
				additional_info: collection.additionalInfoTemp,
				remove: false
			}
		};
		const url = "/groups/invoice/update";
		this.bdevService.doPostWithParams(url, update_collection).subscribe(
			(response) => {
				//if editing date
				collection.additionalInfo = collection.additionalInfoTemp;
				collection.editingAdditionalInfo = false;
				this.responseHandler.success(response);
			},
			(error) => {
				this.responseHandler.error(error, "updateCollectionAdditionalInfo()");
			}
		);
	}

	updateCollectionAmount(form: NgForm, collection: any) {
		const update_collection = {
			schoolid: this.routeParams.school_id,
			invoiceid: this.selected_profoma.invoiceId,
			update_invoice_collection: {
				collectionid: this.selected_collection.collectionId,
				amount: this.selected_collection.amountTemp,
				date: this.selected_collection.collectionDate,
				additional_info: this.selected_collection.additionalInfoTemp,
				remove: false
			}
		};
		const url = "/groups/invoice/update";
		this.bdevService.doPostWithParams(url, update_collection).subscribe(
			(response) => {
				//if editing date
				collection.amount = collection.amountTemp;
				collection.editingAmount = false;
				this.responseHandler.success(response);
			},
			(error) => {
				this.responseHandler.error(error, "updateCollectionAmount()");
			}
		);
	}

	initEditCollection(collection, status) {
		collection.editStatus = status;
		if (!status) {
			collection.editingCollectionDate = false;
			collection.editingAdditionalInfo = false;
			collection.editingAmount = false;
		}
		this.selected_collection = collection;
	}

	initEditCollectionDate(collection) {
		//                collection.collectionDateTemp = collection.collectionDate;
		//splice the date
		const d = collection.collectionDate.split("/");
		//month - day- year
		collection.collectionDateTemp = d[2] + "-" + d[1] + "-" + d[0];
		collection.editingCollectionDate = true;
	}

	//initializ edit collection additional info
	initEditCollectionAdditionalInfo(collection) {
		collection.additionalInfoTemp = collection.additionalInfo;
		collection.editingAdditionalInfo = true;
	}
	//initializ edit collection amount
	initEditCollectionAmount(collection) {
		collection.amountTemp = collection.amount;
		collection.editingAmount = true;
	}

	//delete collection
	deleteCollection(collection: any, index) {
		this.selected_collection = collection;
		////console.log(collection);
		const title = this.translate.instant(
			"litemore.bdevs.invoices.deleteCollection.title"
		);
		const text = this.translate.instant(
			"litemore.bdevs.invoices.deleteCollection.text"
		);
		Swal.fire({
			title: title,
			text: text,
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant(
				"litemore.bdevs.invoices.deleteCollection.yes"
			),
			cancelButtonText: this.translate.instant(
				"litemore.bdevs.invoices.deleteCollection.no"
			)
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				const url = "/groups/invoice/update";
				const update_collection = {
					schoolid: this.routeParams.school_id,
					invoiceid: this.selected_profoma.invoiceId,
					update_invoice_collection: {
						collectionid: this.selected_collection.collectionId,
						amount: this.selected_collection.amount,
						date: this.selected_collection.updatedOn,
						additional_info: this.selected_collection.additionalInfo,
						remove: true
					}
				};
				this.bdevService.doPostWithParams(url, update_collection).subscribe(
					(response) => {
						//reload the collection list
						// this.reloadInvoiceCollections();
						this.selected_profoma.collections.splice(index, 1);
						this.responseHandler.success(response);
					},
					(error) => {
						this.responseHandler.error(error, "deleteCollection()");
					}
				);
			}
		});
	}

	//print the collection as pdf
	printCollection(collection) {
		collection.schoolName = this.schoolInfo.school.schoolName;
		collection.itemType = this.selected_profoma.mainInvoiceItem;
		collection.customer_care_number = this.userInit.customer_care_number;
		this.bdevService.generateCollectionDocument(collection).subscribe(
			(r) => {
				this.toastService.success(
					this.translate.instant(
						"litemore.bdevs.invoices.documentDownloadSuccess"
					)
				);
			},
			(e) => {
				this.toastService.error(
					this.translate.instant(
						"litemore.bdevs.invoices.couldNotGenerateDocument"
					)
				);
			}
		);
	}

	downloadAsPdf() {
		this.selected_profoma.schoolName = this.schoolInfo.school.schoolName;

		this.selected_profoma.invoiceAmount = this.selected_profoma.grossAmount;
		this.selected_profoma.schoolName = this.schoolInfo.school.schoolName;
		this.selected_profoma.invoiceAmount = this.selected_profoma.grossAmount;
		this.selected_profoma.customer_care_number =
			this.userInit.customer_care_number;
		console.warn("this.selected_profoma >> ", this.selected_profoma);
		this.bdevService
			.generateInvoiceDocument(this.selected_profoma, false)
			.subscribe(
				(s) => {
					this.toastService.success(
						this.translate.instant("litemore.bdevs.invoices.downloadComplete")
					);
				},
				(e) => {
					this.toastService.error(
						this.translate.instant(
							"litemore.bdevs.invoices.deleteCollection.couldNotDownloadRequestedDocument"
						)
					);
					console.error("Error >> ", e);
				}
			);
		// this.selected_profoma.customer_care_number = this.user_init.customer_care_number;
		// utilityService.generateInvoiceDocument(this.selected_profoma);
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}
}
