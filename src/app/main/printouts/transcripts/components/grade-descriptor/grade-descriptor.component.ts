import { Component, Input } from "@angular/core";

@Component({
	selector: "app-grade-descriptor",
	templateUrl: "./grade-descriptor.component.html",
	styleUrls: ["./grade-descriptor.component.scss"]
})
export class GradeDescriptorComponent {
	@Input() gradingSystems: any[] = [];
	@Input() isPrintFormat = false;

	get headerStyles(): string | null {
		return this.isPrintFormat ? "font-size: 10pt" : null;
	}

	get tableStyles(): string | null {
		return this.isPrintFormat ? "font-size: 8pt" : null;
	}
}
