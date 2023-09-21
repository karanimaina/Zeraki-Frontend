import { ComponentFixture, TestBed } from "@angular/core/testing";

import { WatermarkComponent } from "./watermark.component";
import {HttpClientModule} from "@angular/common/http";

describe("WatermarkComponent", () => {
	let component: WatermarkComponent;
	let fixture: ComponentFixture<WatermarkComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule],
			declarations: [ WatermarkComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(WatermarkComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
