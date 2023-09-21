import { ComponentFixture, TestBed } from "@angular/core/testing";

import { FinanceComponent } from "./finance.component";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";
import {RouterTestingModule} from "@angular/router/testing";
import {LocalUser} from "../../@core/models/user";
import {FinanceService} from "../../@core/services/finance/finance.service";

describe("FinanceComponent", () => {
	let component: FinanceComponent;
	let fixture: ComponentFixture<FinanceComponent>;
	const financeService = jasmine.createSpyObj("FinanceService", [
		"getFeeBalanceByAdm",
		"getStkData",
		"setStudent"
	]);
	const loggedInUser: Partial<LocalUser> = {
		admno: "ADM/001",
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports:[
				HttpClientModule,
				TranslateModule.forRoot(),
				RouterTestingModule.withRoutes([])
			],
			declarations: [ FinanceComponent ],
			providers: [
				{provide: FinanceService, useValue: financeService}
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(FinanceComponent);
		component = fixture.componentInstance;
		component.loggedInUser = <LocalUser>loggedInUser;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
