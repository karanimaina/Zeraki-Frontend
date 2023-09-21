import { ComponentFixture, TestBed } from "@angular/core/testing";

import { PDashboardComponent } from "./p-dashboard.component";
import {HttpClientModule} from "@angular/common/http";
import {TranslateModule} from "@ngx-translate/core";
import {FinanceService} from "../../../@core/services/finance/finance.service";
import {of} from "rxjs";

describe("PDashboardComponent", () => {
	let component: PDashboardComponent;
	let fixture: ComponentFixture<PDashboardComponent>;
	const financeService: jasmine.SpyObj<FinanceService> = jasmine.createSpyObj("FinanceService",
		{
			getAllFeeBalanceByIntake: of([]),
			getFeeBalanceByStream: of([]),
			getFinanceStatistics: of([]),
		},
		{
			academicYears$: of({
				list: [
					{
						id: 1,
						endDate: "2021-12-31",
						beginDate: "2021-01-01",
					}
				]
			}),
			voteHeadCategories$: of([]),
		});

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				TranslateModule.forRoot()
			],
			declarations: [ PDashboardComponent ],
			providers: [
				{provide: FinanceService, useValue: financeService}
			]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(PDashboardComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

});
