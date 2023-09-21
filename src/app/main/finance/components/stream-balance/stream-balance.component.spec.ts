import { ComponentFixture, TestBed } from "@angular/core/testing";

import { StreamBalanceComponent } from "./stream-balance.component";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";

describe("StreamBalanceComponent", () => {
	let component: StreamBalanceComponent;
	let fixture: ComponentFixture<StreamBalanceComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				TranslateModule.forRoot()
			],
			declarations: [ StreamBalanceComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StreamBalanceComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
