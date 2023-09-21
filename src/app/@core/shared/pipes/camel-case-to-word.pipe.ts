import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
	name: "camelCaseToWord"
})
export class CamelCaseToWordPipe implements PipeTransform {
	transform(value?: string): string {
		if (value) {
			let word = value.replace(/([A-Z])/g, " $1");
			word = word.charAt(0).toUpperCase() + word.slice(1);

			return word;
		}

		return "";
	}

}
