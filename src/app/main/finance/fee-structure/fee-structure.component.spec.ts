import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FeeStructureComponent } from "./fee-structure.component";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";

describe("FeeStructureComponent", () => {
	let component: FeeStructureComponent;
	let fixture: ComponentFixture<FeeStructureComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				TranslateModule.forRoot()
			],
			declarations: [ FeeStructureComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FeeStructureComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
