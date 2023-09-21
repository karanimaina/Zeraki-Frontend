import { Component, OnInit, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import * as FileSaver from "file-saver";
import { Newsletter } from "src/app/@core/models/news-letter";
import { EventsService } from "src/app/@core/services/events/events.service";
import Swal from "sweetalert2";
import { RolesService } from "../../../@core/shared/services/role/roles.service";



@Component({
	selector: "app-news-letter",
	templateUrl: "./news-letter.component.html",
	styleUrls: ["./news-letter.component.scss"]
})
export class NewsLetterComponent implements OnInit {
	@ViewChild("aForm") aForm: any;
	showAddView = false;
	addViaDocument = false;
	editViaDocument = false;
	showEditView = false;
	isViewNewsLetter = false;
	selectedNewsLetter: any = {
		name: "",
		file: "https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf",
		description: ""
	};

	f: any = "https://www.clickdimensions.com/links/TestPDFfile.pdf";

	newsLetters: any[] = [];

	constructor(
		private eventService: EventsService,
		private rolesService: RolesService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private linkSanitizer: DomSanitizer) { }

	ngOnInit(): void {
		this.loadNewsLetters();
		this.getUserRoles();
		this.f = this.linkSanitizer.bypassSecurityTrustResourceUrl(this.f);
	}
	userRoles: any = {};
	getUserRoles(): void {
		this.rolesService.roleSubject.subscribe(
			(userRoles) => {
				this.userRoles = userRoles;
			}
		);
	}

	cleanURL(oldURL: string): SafeResourceUrl {
		return this.linkSanitizer.bypassSecurityTrustResourceUrl(oldURL);
	}

	loadNewsLetters() {
		// this.newsLetters = this.even tService.getAllNewsLetters()
		this.eventService.getAllNewsLetters().subscribe((res) => {
			this.newsLetters = res;
		}, (err) => {
			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}

	public model = {
		name: "",
		file: "",
		description: ""
	};

	toggleAddViaDoc() {
		this.addViaDocument = !this.addViaDocument;
		this.aForm.reset();
	}

	uploadedFile: any;
	onPdfUpload(event: any) {
		this.uploadedFile = event.target.files[0];
		console.log(this.uploadedFile);
	}
	onSubmit(form: NgForm) {
		if (!form.valid) {
			return;
		}

		const postData: any = {
			file: null,
			data: {
				newsletterContent: null,
				contentType: -1,
				newsletterTitle: this.model.name
			}
		};
		/**
	 * NOTE
	 * FOR POST
	 * CONTENTTYPE = 2 -> Entered content
	 * CONTENTTYPE = 1 -> uploaded pdf
	 */

		//submit content created
		if (!this.addViaDocument) {
			postData.data.newsletterContent = this.model.description;
			postData.data.contentType = 2;
		}
		//submit via file
		if (this.addViaDocument) {
			postData.data.contentType = 1;
			postData.file = this.uploadedFile;
			delete postData["data"]["newsletterContent"];
		}

		const f = new FormData();

		f.append("file", postData.file);
		f.append("data", JSON.stringify(postData.data));

		this.eventService.addNewsLetter(f).subscribe(
			(res) => {
				// this.toastService.success(res.response.message)
				Swal.fire({
					title: res.response.title,
					icon: "success",
					text: res.response.message,
					confirmButtonText: this.translate.instant("common.swal.confirmButtonTextClose")
				});
				this.loadNewsLetters();
				form.resetForm();
				this.showAddView = false;
				(postData.data.contentType == 2) ? this.model.description = "" : "";
			},
			(err) => {
				console.log(err);
				// this.toastService.error(err.error.response.message)
			}
		);
	}

	viewNewsLetter(obj: any) {
		this.selectedNewsLetter = obj;
		this.selectedNewsLetter.title = (obj.contentType == 1) ? "title_pdf" : "title_word";
		// let pdfUrl = 'https://zeraki-analytics.s3.eu-central-1.amazonaws.com/newsletters/T2Q9ZH44G6CWKH52989191650537513011.pdf';
		const pdfUrl = "https://frontendmasters.com/assets/resources/lukasruebbelke/better-apps-angular-2-day1.pdf";
		// this.selectedNewsLetter.newsletterContent = (obj.contentType == 1) ? pdfUrl : this.selectedNewsLetter.newsletterContent
		this.isViewNewsLetter = true;

	}

	editNewsletter(obj: any, index: any) {
		this.selectedNewsLetter = obj;
		this.selectedNewsLetter.index = index;
		this.selectedNewsLetter.file = "";
		this.selectedNewsLetter.title = this.selectedNewsLetter.newsletterTitle;
		this.selectedNewsLetter.title_temp = this.selectedNewsLetter.title;
		(obj.contentType == 1) ? this.editViaDocument = true : this.editViaDocument = false;
		(obj.contentType == 2) ? this.selectedNewsLetter.newsletterContent_temp = this.selectedNewsLetter.newsletterContent : "";

		this.showEditView = true;
	}
	uploadedFileEdit: any;
	onPdfUploadEdit(event: any) {
		/* wire up file reader */
		const target: DataTransfer = <DataTransfer>(event.target);
		this.uploadedFileEdit = target.files[0];
	}
	onSubmitUpdate(form: NgForm) {
		if (!form.valid) {
			return;
		}
		const postData: any = {
			file: null,
			data: {
				newsletterId: this.selectedNewsLetter.newsletterId,
				newsletterContent: null,
				contentType: -1,
				newsletterTitle: this.selectedNewsLetter.title_temp
			}
		};
		/**
	 * NOTE
	 * FOR POST
	 * CONTENTTYPE = 2 -> Entered content
	 * CONTENTTYPE = 1 -> uploaded pdf
	 */

		//submit content created
		if (this.selectedNewsLetter.contentType == 2) {
			postData.data.newsletterContent = this.selectedNewsLetter.newsletterContent_temp;
			postData.data.contentType = 2;
		}
		//submit via file
		if (this.selectedNewsLetter.contentType == 1) {
			postData.data.contentType = 1;
			postData.file = this.uploadedFileEdit;
			delete postData["data"]["newsletterContent"];
		}

		const f = new FormData();

		f.append("file", postData.file);
		f.append("data", JSON.stringify(postData.data));

		this.eventService.updateNewsLetter(f).subscribe(
			(res) => {
				// this.toastService.success("Newsletter successfully updated!")
				Swal.fire({
					title: res.response.title,
					icon: "success",
					text: res.response.message,
					confirmButtonText: this.translate.instant("common.swal.confirmButtonTextClose")
				});
				const obj = this.selectedNewsLetter;
				obj.newsletterTitle = obj.title_temp;
				(obj.contentType == 2) ? obj.newsletterContent = obj.newsletterContent_temp : "";
				this.newsLetters[obj.index] = obj;
				this.showEditView = false;
			},
			(err) => {
				//console.log(err)
				// this.toastService.error(err.error.response.message)
			}
		);
		//proceed to post new values


	}

	deleteNewsLetter(obj: any, index: any) {
		Swal.fire({
			// title: "Delete Newsletter?",
			title: this.translate.instant("events.newsletter.swal.title"),
			icon: "question",
			text: this.translate.instant("events.newsletter.swal.text", { title: obj.newsletterTitle }),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextCancel"),
			cancelButtonColor: "#b7c1d1",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextProceed"),
			confirmButtonColor: "#43ab49"
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				//-----------------------------
				//  CALL THE DELETE API HERE
				//-----------------------------
				this.eventService.deleteNewsletter(obj.newsletterId).subscribe((res) => {
					Swal.fire({
						title: this.translate.instant("common.swal.titleSuccess"),
						icon: "success",
						text: this.translate.instant("events.newsletter.swal.text2")
					});
					this.newsLetters.splice(index, 1);
				}, (err) => {
					const message = this.translate.instant("events.newsletter.toastMessages.deleteError");
					this.toastService.error(message);
				});

			}
		});
	}

	downloadFile(letter: Newsletter) {
		FileSaver.saveAs(letter.newsletterContent, `${letter.newsletterTitle}.pdf`);
	}

	printPage(printSectionId: string) {

		const innerContents = document?.getElementById(printSectionId)?.innerHTML;
		//var allContent =
		const popupWinindow = window.open("", "_blank", "width=device-width");
		popupWinindow?.document.open();
		popupWinindow?.document.write("<!DOCTYPE html><html><head><link rel=\"stylesheet\" href=\"assets_new/styles/vendor.cf60403d.css\"><link rel=\"stylesheet\" href=\"assets_new/styles/style.bb02c2e3.css\"><script>window.onload= function () { window.print();window.close();   }  </script></head><body>" + innerContents + "</html>");
		popupWinindow?.document.close();
	}


}
