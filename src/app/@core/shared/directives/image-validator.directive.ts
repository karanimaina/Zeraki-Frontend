import {Directive} from "@angular/core";
import {FormControl, NG_VALIDATORS, Validator} from "@angular/forms";

@Directive({
	selector: "[imageValidator]",
	providers: [{
		provide: NG_VALIDATORS,
		useExisting: ImageValidatorDirective,
		multi: true
	}]
})
export class ImageValidatorDirective implements Validator {
	static validate(control: FormControl): { [key: string]: any } | null {
		if (control.value) {
			if (control.value[0]){
				return ImageValidatorDirective.checkExtension(control);
			}
		}
		return null;
	}

	private static checkExtension(c: FormControl){
		const allowedExtensions = ["jpg", "jpeg", "png"];
		const file = c.value.replace(/^.*[\\/]/, "");
		const extension = file.split(".")[1].toLowerCase();

		const isValid = allowedExtensions.includes(extension);

		return !isValid ? {unsupportedFileType: true} : null;
	}

	validate(c: FormControl): { [key: string]: any } | null {
		return ImageValidatorDirective.validate(c);
	}
}
