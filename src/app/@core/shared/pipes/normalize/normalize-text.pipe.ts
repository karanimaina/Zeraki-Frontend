import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "normalizeText"
})
export class NormalizeTextPipe implements PipeTransform {

	transform(text: string): string {
		if (!text) {
			return "";
		}
		return text.split("_").join(" ");
	}

}
