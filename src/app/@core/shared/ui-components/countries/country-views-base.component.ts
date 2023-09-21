import { Component, ElementRef, Input, OnInit, TemplateRef} from "@angular/core";
import { SchoolTypes } from "src/app/@core/enums/school-types";

@Component({
	template: ""
})
export abstract class CountryViewsBaseComponent implements OnInit {
	@Input() template!: TemplateRef<any>;
	schoolTypes = SchoolTypes;

	protected constructor(private element: ElementRef) {
		this.element = element;
	}

	ngOnInit() {
		this.removeParentElementTag();
	}

	/**
	 * Remove parent element tag to prevent css from breaking
	 *
	 * @example
	 * // The following is the default behavior of angular
	 * <ui-guinea-school>
	 *   <div class="css-class">
	 *   </div>
	 * </ui-guinea-school>
	 *
	 * // The following is the desired behavior
	 * <div class="css-class">
	 * </div>
	 * @private
	 */
	private removeParentElementTag() {
		const nativeElement: HTMLElement = this.element.nativeElement;
		const parentElement: HTMLElement = nativeElement.parentElement!;
		// move all children out of the element
		while (nativeElement.firstChild) {
			parentElement.insertBefore(nativeElement.firstChild, nativeElement);
		}
		// remove the empty element(the host)
		parentElement.removeChild(nativeElement);
	}
}
