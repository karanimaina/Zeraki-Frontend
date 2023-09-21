import { Component, Input, ViewChild, ElementRef, Output, EventEmitter } from "@angular/core";
import { SubmitFormGroup } from "src/app/@core/models/submit-file";

const inputTypes = ["input", "select", "checkbox", "radio"];

@Component({
	selector: "app-submit-form",
	template: `<form #formElement [formGroup]="formGroup" (ngSubmit)="submit()">
                  <ng-content></ng-content>
            </form>`
})
export class SubmitFormComponent {

    /**
     * Form values container
     */
    @Input() formGroup!: SubmitFormGroup;

    /**
     * Html form element reference
     */
    @ViewChild("formElement") formElement!: ElementRef<HTMLFormElement>;

    /**
     * Event fired when form is submitted
     */
    @Output("onSubmit") _onSubmit: EventEmitter<any> = new EventEmitter<any>();

    /**
     * Form submit event handler
     * Modifies isSubmitted form group property to true and send form value to parent component
     */
    submit(emit = true): void {
    	this.toggleSubmittedClass();
    	this.formGroup.isSubmitted = true;
    	if (emit && this.formGroup.valid) {
    		this.onSubmit();
    	}
    }

    /**
     * Remove ng-submitted class from all children inputs & reset formGroup
     * @param value any default value of form
     * @param options resetting options
     */
    reset(value?: any, options?: { onlySelf?: boolean; emitEvent?: boolean }): void {
    	this.toggleSubmittedClass(true);
    	this.formGroup.reset(value, options);
    }

    onSubmit() {
    	this._onSubmit.next(this.formGroup.value);
    }

    /**
     * Add/Remove ng-submitted class to/from all children inputs
     * @param remove boolean is remove action or add
     */
    private toggleSubmittedClass(remove = false): void {
    	const submittedClass = "ng-submitted";
    	const collections: Array<HTMLCollectionOf<Element>> = [];
    	const formElem = this.formElement.nativeElement;
    	remove ? formElem.classList.remove(submittedClass) : formElem.classList.add(submittedClass);
    	let field;
    	inputTypes.forEach(i => collections.push(formElem.getElementsByTagName(i)));
    	collections.forEach(c => {
    		for (let i = 0; i < c.length; i++) {
    			field = c.item(i);
    			if (field && field.classList) {
    				remove ? field.classList.remove(submittedClass) : field.classList.add(submittedClass);
    			}
    		}
    	});
    }

}