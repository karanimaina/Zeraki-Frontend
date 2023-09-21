import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import Swal from "sweetalert2";

@Component({
	templateUrl: "./faq-category-details.component.html",
	styleUrls: ["./faq-category-details.component.scss"]
})
export class FaqCategoryDetailsComponent implements OnInit, OnDestroy {
	faqCategoryDetailsSub!: Subscription;
	faqCategoryDetailsLoading = false;
	faqCategoryDetails: any;

	faqAddSub!: Subscription;
	faqAddLoading = false;

	faqDeleteSub!: Subscription;
	faqDeleteLoading = false;

	new_groups_num = 0;
	add_new_group = false;

	categoryID!: number;

	constructor(
    private route: ActivatedRoute,
    private litemoreService: LitemoreService,
    private toast: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnInit(): void {
		const categoryID = this.route.snapshot.paramMap.get("categoryID");
		this.categoryID = Number(categoryID);

		this.getFaqCategory(this.categoryID);
	}

	ngOnDestroy(): void {
		this.faqCategoryDetailsSub?.unsubscribe();
		this.faqAddSub?.unsubscribe();
		this.faqDeleteSub?.unsubscribe();
	}

	getFaqCategory(categoryID: number) {
		this.faqCategoryDetailsLoading = true;

		this.litemoreService.getFaqCategory(categoryID).subscribe({
			next: ((resp: any) => {
				console.log(resp);

				this.faqCategoryDetails = resp;
				this.new_groups_num = 0;
				this.faqCategoryDetailsLoading = false;
			}),
			error: err => {
				console.error(err);

				this.faqCategoryDetailsLoading = false;
				this.toast.error("common.toastMessages.anErrorOccurred2");
			},
		});
	}

	addNewFaqCategory() {
		this.faqCategoryDetails.faqs.push({ title: "", description: "" });
		this.add_new_group = true;
		this.new_groups_num = 0;

		this.faqCategoryDetails.faqs.forEach((faq) => {
			if (faq.edit != null && faq.edit) {
				faq.edit = false;
			}
			if (faq.faqid == null) {
				this.new_groups_num++;
			}
		});
	}

	removeNewGroup(index: number) {
		this.faqCategoryDetails.faqs.splice(index, 1);
		this.new_groups_num--;
		if (this.new_groups_num === 0) {
			this.add_new_group = false;
		}
	}

	discardNewGroups() {
		for (let i = this.faqCategoryDetails.faqs.length - 1; i >= 0; i--) {
			if (this.faqCategoryDetails.faqs[i].faqid == null) {
				this.faqCategoryDetails.faqs.splice(i, 1);
			}
		}
		this.new_groups_num = 0;
		this.add_new_group = false;
	}

	error_st = false;
	error_msg = "";

	addNewFaq() {
		const faqs: any[] = [];

		this.faqCategoryDetails.faqs.forEach((faq: any) => {
			if (faq.faqid == null) {
				faqs.push(faq);
			}
		});

		this.faqAddSub = this.litemoreService.addFaq(this.categoryID, faqs).subscribe({
			next: ((resp: any) => {
				// console.log(resp);

				if (resp.responseCode !== undefined && resp.responseCode == 200) {
					this.toast.success(this.translate.instant("litemore.faqs.toastMessages.addSuccess"));
					this.add_new_group = false;
					this.faqAddLoading = false;
					this.getFaqCategory(this.categoryID);
				}
			}),
			error: err => {
				console.error(err);

				this.error_st = true;
				this.error_msg = this.translate.instant("common.toastMessages.anErrorOccurred");
				this.toast.error(this.error_msg);

				this.faqAddLoading = false;
			}
		});
	}

	deleteFaq(index: number, faqID: number) {
		Swal.fire({
			title: this.translate.instant("litemore.faqs.swal.deleteFaqTitle"),
			text: this.translate.instant("litemore.faqs.swal.deleteFaqText"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				this.faqDeleteLoading = true;

				this.faqDeleteSub = this.litemoreService.deleteFaq(faqID).subscribe({
					next: (resp: any) => {
						console.log(resp);

						this.faqCategoryDetails.faqs.splice(index, 1);
						this.toast.success(this.translate.instant("litemore.faqs.toastMessages.deleteSuccess"));

						this.faqDeleteLoading = false;
					},
					error: err => {
						console.error(err);

						this.faqDeleteLoading = false;
						this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
					}
				});

			}
		});

	}

}
