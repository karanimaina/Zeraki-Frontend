import { Component, OnDestroy, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from "rxjs";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";
import Swal from "sweetalert2";

@Component({
	templateUrl: "./faq-categories-list.component.html",
	styleUrls: ["./faq-categories-list.component.scss"]
})
export class FaqCategoriesListComponent implements OnInit, OnDestroy {
	faqCategoryListSub!: Subscription;
	faqCategoryListLoading = false;
	faqCategoryList: any[] = [];

	faqCategoryDeleteSub!: Subscription;
	faqCategoryDeleteLoading = false;

	faqCategorySaveSub!: Subscription;
	faqCategorySaveLoading = false;

	add_new_group = false;
	new_groups_num = 0;

	constructor(
    private litemoreService: LitemoreService,
    private toast: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnInit(): void {
		this.retrieveFaqCategoryList();
		// this.resetEditValue();
	}

	ngOnDestroy(): void {
		this.faqCategoryListSub?.unsubscribe();
		this.faqCategoryDeleteSub?.unsubscribe();
		this.faqCategorySaveSub?.unsubscribe();
	}

	resetEditValue() {
		this.faqCategoryList.forEach((faqCategory: any) => {
			faqCategory.edit = false;
		});
	}

	retrieveFaqCategoryList() {
		this.faqCategoryListLoading = true;

		this.faqCategoryListSub = this.litemoreService.getFaqCategories().subscribe({
			next: (resp: any) => {
				// console.log(resp);

				this.faqCategoryList = resp;
				this.new_groups_num = 0;
				this.resetEditValue();
				this.faqCategoryListLoading = false;
			},
			error: err => {
				console.error(err);

				this.faqCategoryListLoading = false;
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
			}
		});
	}

	addNewFaqCategory() {
		this.faqCategoryList.push({ name: "" });

		this.add_new_group = true;
		this.new_groups_num = 0;

		this.faqCategoryList.forEach(faqCategory => {
			if (faqCategory.edit != null && faqCategory.edit) {
				faqCategory.edit = false;
			}
			if (faqCategory.categoryid == null) {
				this.new_groups_num++;
			}
		});
	}

	removeNewGroup(index: number) {
		this.faqCategoryList.splice(index, 1);
		this.new_groups_num--;
		if (this.new_groups_num === 0) {
			this.add_new_group = false;
		}
	}

	discardNewGroups() {
		for (let i = this.faqCategoryList.length - 1; i >= 0; i--) {
			if (this.faqCategoryList[i].categoryid == null) {
				this.faqCategoryList.splice(i, 1);
			}
		}
		this.new_groups_num = 0;
		this.add_new_group = false;
	}

	saveStaffGroups() {
		const newStaffGroups: any[] = [];

		this.faqCategoryList.forEach((faqCategory: any) => {
			if (faqCategory.categoryid == null && faqCategory.name_temp != null) {
				newStaffGroups.push(faqCategory.name_temp);
			}
		});

		// console.log("Add FAQ categories:", newStaffGroups);

		this.faqCategorySaveLoading = false;

		this.faqCategorySaveSub = this.litemoreService.addFaqCategories(newStaffGroups).subscribe({
			next: (resp: any) => {
				// console.log(resp);

				if (resp.responseCode !== undefined && resp.responseCode == 200) {
					this.faqCategorySaveLoading = false;
					const message = this.translate.instant("litemore.faqs.categories.toastMessages.addFaqCategory");
					this.toast.success(message);
					this.add_new_group = false;
					this.retrieveFaqCategoryList();
				}
			},
			error: err => {
				console.error(err);

				this.faqCategorySaveLoading = false;
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
			}
		});

	}

	deleteFaqCategory(index: number, categoryID: number) {
		Swal.fire({
			title: this.translate.instant("litemore.faqs.categories.swal.deleteFaqCategoryTitle"),
			text: this.translate.instant("litemore.faqs.categories.swal.deleteFaqCategoryText"),
			icon: "warning",
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
		}).then((isConfirm) => {
			if (isConfirm.isConfirmed) {
				// console.log("Call API to delete FAQ Category:", categoryID);

				this.faqCategoryDeleteLoading = true;

				this.faqCategoryDeleteSub = this.litemoreService.deleteFaqCategory(categoryID).subscribe({
					next: (resp: any) => {
						console.log(resp);

						this.faqCategoryList.splice(index, 1);
						const message = this.translate.instant("litemore.faqs.categories.toastMessages.deleteSuccess");
						this.toast.success(message);
						this.faqCategoryDeleteLoading = false;
					},
					error: err => {
						console.error(err);

						this.faqCategoryDeleteLoading = false;
						this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
					}
				});
			}
		});
	}

}
