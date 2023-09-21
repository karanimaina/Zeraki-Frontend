import {Directive, HostListener, Self} from "@angular/core";
import {ControlContainer} from "@angular/forms";

@Directive({
	selector: "form[formGroup]"
})
export class MarkAllTouchedDirective {

	constructor(
        @Self() private  container: ControlContainer
	) { }

	@HostListener("submit")
	public onSubmit(): void {
		this.container.control?.markAllAsTouched();
	}
}
