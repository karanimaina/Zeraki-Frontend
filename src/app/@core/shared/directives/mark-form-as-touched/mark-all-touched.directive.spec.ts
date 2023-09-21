import { MarkAllTouchedDirective } from "./mark-all-touched.directive";
import {Component, ViewChild} from "@angular/core";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {By} from "@angular/platform-browser";


@Component({
	template: `
		<form [formGroup]="formGroup" (ngSubmit)="onSubmit()">
			<input type="text" formControlName="testInput">
		</form>
	`
})
class TestFormComponent {
	@ViewChild(MarkAllTouchedDirective) markAllTouchedDirective!: MarkAllTouchedDirective;
	formGroup!: FormGroup;

	onSubmit(): void {

	}
}


describe("MarkAllTouchedDirective", () => {
	let component: TestFormComponent;
	let fixture: ComponentFixture<TestFormComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			declarations: [TestFormComponent, MarkAllTouchedDirective],
			imports: [FormsModule, ReactiveFormsModule]
		});

		fixture = TestBed.createComponent(TestFormComponent);
		component = fixture.componentInstance;
		component.formGroup = new FormGroup({
			testInput: new FormControl()
		});
		fixture.detectChanges();
	});

	it("should call markAllAsTouched on form submission", function () {
		spyOn(component.formGroup, "markAllAsTouched");

		const form = fixture.debugElement.query(By.css("form"));
		form.triggerEventHandler("ngSubmit", null);
		fixture.detectChanges();

		expect(component.formGroup.markAllAsTouched).toHaveBeenCalled();
	});
});
