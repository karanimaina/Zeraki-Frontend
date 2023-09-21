import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { DataService } from "src/app/@core/shared/services/data/data.service";
import { LitemoreUser1 } from "src/app/@core/models/litemore/users/litemore";
import { BdevService } from "src/app/@core/services/litemore/bdev/bdev.service";
import { InvoiceService } from "src/app/@core/services/litemore/invoice/invoice.service";
import { LitemoreUserService } from "src/app/@core/services/litemore/user/litemore-user.service";
import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { ResponseHandlerService } from "src/app/@core/shared/services/response-handler/response-handler.service";
import { TranslateService } from "@ngx-translate/core";
import { Location } from "@angular/common";

@Component({
	selector: "app-invoice-list",
	templateUrl: "./invoice-list.component.html",
	styleUrls: ["./invoice-list.component.scss"]
})
export class InvoiceListComponent implements OnInit {
	routeParams: any;
	loggedInUser!: LitemoreUser1;
	userInit: any;
	schoolInfo: any;
	invoices: any;
	selectedInvoice: any;
	readonly LitemoreUserRole = LitemoreUserRole;

	isInvoiceTable = true;
	isCreateInvoice = false;
	isUpdateInvoice = false;
	isRecordInvoice = false;
	isPrintPreviewInvoice = false;
	//Toggle between table and view credit-notes
	loading_collections = true;

	heading: any = [1, 2, 3, 4, 5, 6, 7, 8, 9];
	invoice_collections: any = [];
	invoice_items: any = [];
	isSendReminder: any = false;
	sms_template: any = "";
	current_invoice: any = null;
	sms_to_principal: any = true;
	sms_to_relationship_manager: any = false;
	sms_to_contact_person: any = false;

	constructor(
		private route: ActivatedRoute,
		private litemoreUserService: LitemoreUserService,
		private bdevService: BdevService,
		private dataService: DataService,
		private toastService: HotToastService,
		private invoiceService: InvoiceService,
		private responseHandler: ResponseHandlerService,
		private router: Router,
		private translate: TranslateService,
		private location: Location
	) {}

	ngOnInit(): void {
		this.getRouteParams();
		this.loadLoggedInUser();
		this.loadUserInit();
		this.getSchoolInvoices();
		this.getSchoolInfo();
	}

	getRouteParams() {
		this.route.params.subscribe((p) => {
			this.routeParams = p;
		});
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

	getSchoolInvoices() {
		this.invoiceService.getInvoicesFromProforma().subscribe((invoices) => {
			this.invoices = invoices;
		});
	}

	private getSchoolInfo() {
		this.bdevService.getSchoolInfo().subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});
	}

	loadProformaInvoiceBalance() {
		this.bdevService
			.getProformaInvoiceBalance(
				this.routeParams.school_id,
				this.routeParams.proforma_id
			)
			.subscribe((r) => {
				this.schoolInfo.balance = r.balance;
			});
	}

	//reload school Information
	reloadSchoolInfo() {
		this.resetSchoolInfo();
		this.loadProformaInvoiceBalance();
	}

	resetSchoolInfo() {
		this.bdevService.setSchoolInfo(this.routeParams.school_id);
	}

	//Toggle between table list and update list
	showInvoiceSendReminder(invoice: any) {
		this.current_invoice = invoice;
		this.isSendReminder = true;
		this.sms_template = this.translate.instant(
			"litemore.bdevs.invoices.invoice.invoiceList.smsTemplate",
			{
				schoolName: this.schoolInfo.school.schoolName,
				amount: (this.current_invoice.balance || 0).toFixed(2),
				daysLeft: this.current_invoice?.invoiceItems[0].daysLeft,
				managerName: this.schoolInfo.relationshipManager.name,
				managerPhone: this.schoolInfo.relationshipManager.phone,
				customerCareNumber: this.schoolInfo.customer_care_number
			}
		);
	}
	closeInvoiceSendReminder() {
		this.isSendReminder = false;
	}

	sendSmsReminder(form: NgForm) {
		if (form.invalid) {
			return;
		}
		if (
			this.sms_to_principal ||
			this.sms_to_relationship_manager ||
			this.sms_to_contact_person
		) {
			const postSms: any = {
				invoiceId: this.current_invoice.invoiceId,
				schoolId: this.routeParams.school_id,
				sms: form.value.sms_template,
				sendToPrincipal: this.sms_to_principal,
				sendToRelationshipManager: this.sms_to_relationship_manager,
				sendToContactPerson: this.sms_to_contact_person
			};
			//do something
			// console.log(postSms);

			//do a post request here!
			const url = "/invoice/reminder";
			this.bdevService.doPostWithParams(url, postSms).subscribe(
				(response) => {
					this.toggleAction("table");
					let response_message = "";
					let user_not_found_error = "";
					let invalid_sms_recipient = "";
					response_message =
						"<b>" +
						response.response.title +
						"</b><br>" +
						response.response.message;

					if (response.usersNotFound) {
						let list = "<ol>";
						for (let a = 0; a < response.usersNotFound.length; a++) {
							list += "<li>" + response.usersNotFound[a] + "</li>";
						}
						list += "</ol>";
						user_not_found_error = list;
					}
					if (response.invalidSmsRecipients) {
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
					this.closeInvoiceSendReminder();
				},
				(error) => {
					// console.log(error)
					this.responseHandler.error(error, "sendSmsReminder()");
				}
			);
		} else {
			this.toastService.warning(
				this.translate.instant(
					"litemore.bdevs.invoices.invoice.invoiceList.selectAtleastOneRecipient"
				)
			);
		}
	}

	toggleAction(action?: string, invoice?: any) {
		switch (action) {
		case "create":
			this.isInvoiceTable = false;
			this.isCreateInvoice = true;
			this.isRecordInvoice = false;
			this.isUpdateInvoice = false;
			this.isPrintPreviewInvoice = false;
			break;
		case "update":
			this.isInvoiceTable = false;
			this.isCreateInvoice = false;
			this.isRecordInvoice = false;
			this.isUpdateInvoice = true;
			this.isPrintPreviewInvoice = false;
			this.selectedInvoice = invoice;
			break;
		case "table":
			this.isInvoiceTable = true;
			this.isCreateInvoice = false;
			this.isUpdateInvoice = false;
			this.isRecordInvoice = false;
			this.isPrintPreviewInvoice = false;
			break;

		default:
			this.isInvoiceTable = true;
			this.isCreateInvoice = false;
			this.isUpdateInvoice = false;
			this.isRecordInvoice = false;
			this.isPrintPreviewInvoice = false;
			break;
		}
	}

	//Toggle between table and record collection
	showRecordCollection(invoice: any) {
		this.isInvoiceTable = false;
		this.isCreateInvoice = false;
		this.isUpdateInvoice = false;
		this.isPrintPreviewInvoice = false;
		this.isRecordInvoice = true;
		this.current_invoice = invoice;

		//load all items
		this.loading_collections = true;
		this.bdevService.getInvoiceCollections(invoice.invoiceId).subscribe(
			(response) => {
				this.invoice_collections = response.collections;
			},
			(error) => {
				this.responseHandler.error(error, "showRecordCollection()");
				this.loading_collections = false;
			}
		);
	}

	showPrintPreviewInvoice(invoice) {
		this.loading_collections = false;
		this.current_invoice = invoice;
		this.bdevService.getInvoiceCollections(invoice.invoiceId).subscribe(
			(response) => {
				this.invoice_collections = response.collections;

				//load all items
				this.bdevService.getInvoiceCollections(invoice.invoiceId).subscribe(
					(response) => {
						this.invoice_items = response.items;

						this.isInvoiceTable = false;
						this.isCreateInvoice = false;
						this.isUpdateInvoice = false;
						this.isRecordInvoice = false;
						this.loading_collections = false;
						this.isPrintPreviewInvoice = true;
					},
					(error) => {
						//////console.log(error);
						this.loading_collections = false;
						this.responseHandler.error(error, "showPrintPreviewInvoice()");
					}
				);
			},
			(error) => {
				this.responseHandler.error(error, "showPrintPreviewInvoice()");
			}
		);
	}

	reloadInvoiceCollections() {
		this.bdevService
			.getInvoiceCollections(this.current_invoice.invoiceId)
			.subscribe(
				(response) => {
					this.invoice_collections = response.collections;
				},
				(error) => {
					this.loading_collections = false;
					this.responseHandler.error(error, "reloadInvoiceCollections()");
				}
			);
	}

	//form structure update invoice
	update_invoice_gross: any = "";
	update_invoice_due_date: any = "";

	//initiate edit amount
	initiateInvoiceAmountEdit(invoice: any, status: any) {
		invoice.amount_edit = true;
		invoice.invoice_amount_temp = invoice.invoiceAmount;
	}
	//update invoice amount
	updateInvoiceAmount(invoice: any) {
		//                //////console.log(invoice);
		//check for user rights
		//only bdev manager and regional manager
		if (
			[LitemoreUserRole.LITEMORE_ADMIN, LitemoreUserRole.BDEV_MANAGER].some(
				(role) => this.loggedInUser.litemoreRoles.includes(role)
			)
		) {
			const postUpdateInvoice = {
				invoiceId: invoice.invoiceId,
				schoolId: this.routeParams.school_id,
				invoiceItemId: invoice.itemId,
				grossAmount: invoice.invoice_amount_temp,
				dueDate: Date.parse(invoice.extensionDate)
			};
			//////console.log(postUpdateInvoice);
			const putUrl = "/invoice/proforma/invoice";
			this.bdevService.doPutWithParams(putUrl, postUpdateInvoice).subscribe(
				(response) => {
					if (response.response.title === "Success") {
						this.toastService.success(response.response.message);
						//update the invoice amount
						invoice.invoiceAmount = invoice.invoice_amount_temp;
						invoice.amount_edit = false;
					} else {
						this.responseHandler.warn(response);
					}
				},
				(error) => {
					this.responseHandler.error(error, "updateInvoiceAmount()");
				}
			);
		} else {
			this.toastService.warning(
				this.translate.instant(
					"litemore.bdevs.invoices.invoice.invoiceList.sorryYouAreNotAuthorisedToEditThisResource"
				)
			);
		}
	}
	//initiate edit extension date
	initiateInvoiceExtensionDate(invoice: any, status: any) {
		if (invoice.extensionDate.length > 0) {
			//splice the date
			const d = invoice.extensionDate.split("/");
			//month - day- year
			//////console.log(invoice.extensionDate);
			//////console.log(d);
			invoice.extension_date_temp = d[2] + "-" + d[1] + "-" + d[0];
			//                //////console.log(extension_date_temp);
		} else {
			invoice.extension_date_temp = invoice.extensionDate;
		}
		invoice.extension_date_edit = true;
	}
	//update extension date
	updateInvoiceExtensionDate(invoice: any) {
		//this action only done by relationship manager, bdevManager and regionl manager
		if (
			[
				LitemoreUserRole.LITEMORE_ADMIN,
				LitemoreUserRole.BDEV_MANAGER,
				LitemoreUserRole.BDEV
			].some((role) => this.loggedInUser.litemoreRoles.includes(role))
		) {
			const postUpdateInvoice = {
				invoiceId: invoice.invoiceId,
				schoolId: this.routeParams.school_id,
				invoiceItemId: invoice.itemId,
				grossAmount: invoice.invoiceAmount,
				extensionDate: Date.parse(invoice.extension_date_temp)
			};

			const url = "/invoice/proforma/invoice";

			this.bdevService.doPutWithParams(url, postUpdateInvoice).subscribe(
				(response) => {
					if (response.response.title === "Success") {
						this.toastService.success(response.response.message);
						//update the invoice amount
						const d = new Date(invoice.extension_date_temp);
						let day: any = d.getDate();
						if (day < 10) {
							day = "0" + day;
						}
						let month: any = d.getMonth() + 1;
						if (month < 10) {
							month = "0" + month;
						}
						const year = d.getFullYear();
						invoice.extensionDate = day + "/" + month + "/" + year;
						invoice.extension_date_edit = false;
					} else {
						this.toastService.warning(response.response.message);
					}
				},
				(error) => {
					// console.log(error);
					this.toastService.warning(error.error.response.message);
				}
			);
		} else {
			this.toastService.warning(
				this.translate.instant(
					"litemore.bdevs.invoices.invoice.invoiceList.sorryYouAreNotAuthorisedToEditThisResource"
				)
			);
		}
	}

	reloadInvoices(currentPage = 1) {
		this.invoiceService
			.getProformaInvoices(
				this.routeParams.school_id,
				this.routeParams.proforma_id,
				this.routeParams.is_proforma_invoice,
				"?currentPage=" + currentPage
			)
			.subscribe(
				(response) => {
					this.invoices = response;
					this.invoiceService.setInvoices(response);
					this.toggleAction("table");
				},
				(error) => {
					this.responseHandler.error(error, "reloadInvoices()");
				}
			);
	}

	viewCreditNotes(invoice: any) {
		this.router.navigate(["credit-note/" + invoice.invoiceId], {
			relativeTo: this.route.parent
		});
	}

	//reload invoice's proforma balance
	reloadBalance() {
		this.bdevService
			.getProformaInvoiceBalance(
				this.routeParams.school_id,
				this.routeParams.proforma_id
			)
			.subscribe({
				next: (resp) => {
					this.schoolInfo.balance = resp.balance;
				},
				error: (error) => {
					this.responseHandler.error(error, "reloadBalance()");
				}
			});
	}

	back() {
		this.location.back();
	}
}
