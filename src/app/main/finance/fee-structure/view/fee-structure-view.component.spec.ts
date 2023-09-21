import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FeeStructureViewComponent } from "./fee-structure-view.component";
import {ActivatedRoute} from "@angular/router";
import {RouterTestingModule} from "@angular/router/testing";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";

class FakeActivatedRoute {
	snapshot = {
		paramMap: {
			get(): string {
				return "1";
			}
		}
	};
}
describe("FeeStructureViewComponent", () => {
	let component: FeeStructureViewComponent;
	let fixture: ComponentFixture<FeeStructureViewComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				RouterTestingModule.withRoutes([]),
				HttpClientModule,
				TranslateModule.forRoot()
			],
			declarations: [ FeeStructureViewComponent ],
			providers: [
				{
					provide: ActivatedRoute,
					useClass: FakeActivatedRoute
				}
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FeeStructureViewComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
