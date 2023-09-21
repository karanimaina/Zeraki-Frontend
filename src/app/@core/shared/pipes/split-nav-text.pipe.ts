import { Pipe, PipeTransform } from "@angular/core";

/**
   * splits a string into two separate strings for display in top nav of small screened devices
   * @returns an array of two strings to be displayed on the top nav of small screened devices
   * @usage
   *   `value | splitNavText:firstWordsCount`
   * @example
   *   {{ "My Classes" | splitNavText:1 }}
   *   formats to: ["My", "Classes"]
*/
@Pipe({
	name: "splitNavText"
})
export class SplitNavTextPipe implements PipeTransform {

	transform(value: string, firstWordsCount = 1): any {
		const splitTextArr = value.split(" ");
		return [
			splitTextArr.slice(0, firstWordsCount).join(" "),
			splitTextArr.slice(firstWordsCount).join(" "),
		];
	}

}
