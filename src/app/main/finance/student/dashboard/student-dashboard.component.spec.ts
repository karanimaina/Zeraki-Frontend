import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StudentDashboardComponent } from "./student-dashboard.component";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";

describe("StudentDashboardComponent", () => {
	let component: StudentDashboardComponent;
	let fixture: ComponentFixture<StudentDashboardComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				TranslateModule.forRoot()
			],
			declarations: [ StudentDashboardComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentDashboardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
