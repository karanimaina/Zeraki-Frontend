import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentCollectionComponent } from "./student-collection.component";
import {HttpClientModule} from "@angular/common/http";

describe("StudentCollectionComponent", () => {
	let component: StudentCollectionComponent;
	let fixture: ComponentFixture<StudentCollectionComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule],
			declarations: [ StudentCollectionComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentCollectionComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
