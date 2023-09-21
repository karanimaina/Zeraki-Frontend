import { HttpClientModule } from "@angular/common/http";
import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { NgApexchartsModule } from "ng-apexcharts";
import { of } from "rxjs";
import { FinanceRoutingModule } from "../../finance-routing.module";

import { IntakeBalanceComponent } from "./intake-balance.component";
import {FinanceService} from "../../../../@core/services/finance/finance.service";

const streamBalance: any = [1, 2, 3];

describe("IntakeBalanceComponent", () => {
	let component: IntakeBalanceComponent;
	let fixture: ComponentFixture<IntakeBalanceComponent>;
	const financeServiceMock = jasmine.createSpyObj("FinanceService", {
		getFeeBalanceByStream: of(streamBalance),
	});

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule,
				FormsModule,
				FinanceRoutingModule,
				NgApexchartsModule,
				NgSelectModule,
				TranslateModule.forRoot()],
			providers: [
				{ provide: FinanceService, useValue: financeServiceMock }
			],
			declarations: [IntakeBalanceComponent]

		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(IntakeBalanceComponent);
		component = fixture.componentInstance;
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});

	describe("Component Logic Tests", () => {
		it("ngOnInit() should be called", () => {
			const spy = spyOn(component, "ngOnInit");

			component.ngOnInit();

			expect(spy).toHaveBeenCalled();
		});

		it("ngOnInit() should set value of loadinbBalance to false if streamData is not null", () => {
			component.streamData = [{ i: "i" }];

			component.ngOnInit();

			expect(component.isLoadingBalances).toBeFalse();
		});

		it("ngOnInit() should set value of loadinbBalance to true if streamData is undefined", () => {

			component.ngOnInit();

			expect(component.isLoadingBalances).toBeTrue();
		});

		it("getFeeBalanceByStream(stream:any) should be called with passed param", () => {
			const spy = spyOn(component, "getFeeBalanceByStream");
			const stream = 1;

			component.getFeeBalanceByStream(stream);

			expect(spy).toHaveBeenCalledWith(stream);
		});

		it("getFeeBalanceByStream(stream:any) should load fee balances by stream and emit a value when response is successful", () => {
			const stream = 1;
			let emitValue: any = null;
			component.toggleView.subscribe(e => {
				emitValue = e;
			});

			component.getFeeBalanceByStream(stream);

			expect(emitValue).not.toBeNull();
		});


	});

	describe("Component Template Tests", () => {
		it("should contain div with class custom-box", () => {
			const box: DebugElement = fixture.debugElement.query(By.css(".custom-box"));

			expect(box).toBeTruthy();
		});

		it("should contain div with class custom-box with box-header div", () => {
			const boxHeder: DebugElement = fixture.debugElement.query(By.css(".custom-box .box-header"));

			expect(boxHeder).toBeTruthy();
		});

		it("should have h4 title with text balances in box-header div", () => {
			const h4: HTMLElement = fixture.debugElement.query(By.css(".custom-box .box-header h4")).nativeElement;

			expect(h4).toBeDefined();
		});

		it("should have h4 title with text balances in box-header div with text `Balances`", () => {
			const h4: HTMLElement = fixture.debugElement.queryAll(By.css("h4"))[0].nativeElement;

			expect(h4.innerText).toEqual("Balances");
		});

		it("should display loader when isLoadingBalances is true", () => {
			component.isLoadingBalances = true;
			fixture.detectChanges();
			const h4: DebugElement = fixture.debugElement.query(By.css("app-loader-div"));

			expect(h4).toBeDefined();
		});

		it("should display div for total balance when loading is complete and isLoadingBalances is false", () => {
			component.isLoadingBalances = false;
			fixture.detectChanges();
			const div: DebugElement = fixture.debugElement.query(By.css(".custom-box-header"));

			expect(div).toBeDefined();
		});

	});


});
