import {
	AfterViewInit,
	Component,
	ElementRef,
	HostListener
} from "@angular/core";
import { ScreenSize } from "../../../models/screen-resize/screen-size";
import { ScreenResizeService } from "../../services/screen-resize/screen-resize.service";

@Component({
	selector: "app-screen-size-detector",
	templateUrl: "./screen-size-detector.component.html",
	styleUrls: ["./screen-size-detector.component.scss"]
})
export class ScreenSizeDetectorComponent implements AfterViewInit {
	prefix = "is-";

	sizes = [
		{
			id: ScreenSize.XS,
			name: "xs",
			css: "d-block d-sm-none"
		},
		{
			id: ScreenSize.SM,
			name: "sm",
			css: "d-none d-sm-block d-md-none"
		},
		{
			id: ScreenSize.MD,
			name: "md",
			css: "d-none d-md-block d-lg-none"
		},
		{
			id: ScreenSize.LG,
			name: "lg",
			css: "d-none d-lg-block d-xl-none"
		},
		{
			id: ScreenSize.XL,
			name: "xl",
			css: "d-none d-xl-block d-xxl-none"
		},
		{
			id: ScreenSize.XXL,
			name: "xxl",
			css: "d-none d-xxl-block"
		}
	];
	constructor(
		private elementRef: ElementRef,
		private resizeSvc: ScreenResizeService
	) {}

	ngAfterViewInit() {
		this.detectScreenSize();
	}

	@HostListener("window:resize", [])
	private onResize() {
		this.detectScreenSize();
	}

	private detectScreenSize() {
		const currentSize = this.sizes.find((size) => {
			// get the html element
			const element = this.elementRef.nativeElement.querySelector(
				`.${this.prefix}${size.id}`
			);

			/* Check and return its display property value */
			return window.getComputedStyle(element).display !== "none";
		});

		this.resizeSvc.onResize(currentSize?.id || ScreenSize.XS);
	}
}
