import { Component, OnDestroy, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Lightbox, LightboxConfig } from "ngx-lightbox";
import { Subscription } from "rxjs";
import { LitemoreService } from "src/app/@core/services/litemore/litemore.service";

@Component({
	templateUrl: "./faq-list.component.html",
	styleUrls: ["./faq-list.component.scss"]
})
export class FaqListComponent implements OnInit, OnDestroy {
	faqListSub!: Subscription;
	faqListLoading = false;
	faqList: any;

	q2 = false;

	constructor(
    private litemoreService: LitemoreService,
    private toast: HotToastService,
    private translate: TranslateService,
    private lightbox: Lightbox,
    private lightboxConfig: LightboxConfig,
	) { }

	ngOnInit(): void {
		this.retrieveFaqList();
	}

	ngOnDestroy(): void {
		this.faqListSub?.unsubscribe();
	}

	albums: any[] = [
		{
			src: "assets/img/gallery/1.jpg",
			thumb: "assets/img/gallery/1.jpg",
			caption: "Some caption here"
		},
		{
			src: "assets/img/gallery/1.jpg",
			thumb: "assets/img/gallery/1.jpg",
			caption: "Some caption here"
		},
		{
			src: "assets/img/gallery/1.jpg",
			thumb: "assets/img/gallery/1.jpg",
			caption: "Some caption here"
		},
		{
			src: "assets/img/gallery/1.jpg",
			thumb: "assets/img/gallery/1.jpg",
			caption: "Some caption here"
		},
		{
			src: "assets/img/gallery/1.jpg",
			thumb: "assets/img/gallery/1.jpg",
			caption: "Some caption here"
		},
	];

	openLightbox(index: number): void {
		// open lightbox
		this.lightbox.open(this.albums, index, {
			showDownloadButton: true,
			centerVertically: true,
			alwaysShowNavOnTouchDevices: true,
		});
	}

	closeLightbox(): void {
		// close lightbox programmatically
		this.lightbox.close();
	}

	retrieveFaqList() {
		this.faqListLoading = true;

		this.faqListSub = this.litemoreService.getFaqs().subscribe({
			next: (resp: any) => {
				console.log(resp);

				this.faqList = resp.data;
				this.faqListLoading = false;
			},
			error: err => {
				console.error(err);

				this.faqListLoading = false;
				this.toast.error(this.translate.instant("common.toastMessages.anErrorOccurred"));
			}
		});
	}

}
