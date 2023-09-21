import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { MenuItem } from "../../../models/menu/menu-item";
import { ScreenResizeService } from "../../services/screen-resize/screen-resize.service";
import { ScreenSize } from "../../../models/screen-resize/screen-size";
import { delay } from "rxjs/operators";

@Component({
	selector: "ui-nav-bar",
	templateUrl: "./nav-bar.component.html",
	styleUrls: ["./nav-bar.component.scss"]
})
export class NavBarComponent implements OnChanges {
	@Input() menuItems!: Array<MenuItem>;
	copyOfMenuItems: Array<MenuItem> = [];
	moreMenuItems: Array<MenuItem> = [];
	screenSize!: ScreenSize;

	constructor(private resizeService: ScreenResizeService) {
		this.resizeService.onResize$.pipe(delay(0)).subscribe((size) => {
			this.screenSize = size;
			this.updateMenuItems();
		});
	}

	ngOnChanges(changes: SimpleChanges) {
		if (changes.menuItems) {
			this.updateMenuItemLabels();
			this.updateMenuItems();
		}
	}

	private updateMenuItems() {
		if (this.screenSize === ScreenSize.XXL) {
			this.copyOfMenuItems = this.menuItems;
			this.moreMenuItems = [];
		} else if (this.screenSize === ScreenSize.XL) {
			this.moreMenuItems = this.menuItems.slice(5);
			this.copyOfMenuItems = this.menuItems.slice(0, 5);
		} else {
			this.moreMenuItems = this.menuItems.slice(4);
			this.copyOfMenuItems = this.menuItems.slice(0, 4);
		}
	}

	private updateMenuItemLabels(): void {
		this.menuItems.map((item) => (item.labels = this.splitStringIntoChunks(item.label)));
	}

	public splitStringIntoChunks(input: string): string[] {
		const words = input.trim().split(" ");
		const chunks: string[] = [];

		while (words.length != 0) {
			let index = 0;
			const tempWords = [...words];
			const word = tempWords[index];
			const hasNextWord =( index + 1) <= tempWords.length;
			const nextWord = hasNextWord ? tempWords[index + 1] : "";
			const combinedLength = word?.length + nextWord?.length;

			if (hasNextWord && combinedLength <= 15) {
				chunks.push(word + " "+nextWord);
				words.splice(0,2);
			} else {
				chunks.push(word);
				words.splice(0,1);
			}

			index++;
		}

		return chunks;
	}
}
