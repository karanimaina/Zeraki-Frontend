import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FinanceTopNavComponent } from "./finance-top-nav.component";
import {HttpClientModule} from "@angular/common/http";

describe("FinanceTopNavComponent", () => {
	let component: FinanceTopNavComponent;
	let fixture: ComponentFixture<FinanceTopNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule],
			declarations: [ FinanceTopNavComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FinanceTopNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
