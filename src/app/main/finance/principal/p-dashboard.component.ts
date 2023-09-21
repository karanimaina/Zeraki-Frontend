import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable, Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FinanceStudent } from "src/app/@core/models/finance/student";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import {
	ApexAxisChartSeries,
	ApexChart,
	ChartComponent,
	ApexDataLabels,
	ApexPlotOptions,
	ApexYAxis,
	ApexLegend,
	ApexStroke,
	ApexXAxis,
	ApexFill,
	ApexTooltip
} from "ng-apexcharts";
import { formatNumber } from "@angular/common";
import { FinanceService } from "src/app/@core/services/finance/finance.service";

export type ChartOptions = {
	series: ApexAxisChartSeries;
	chart: ApexChart;
	dataLabels: ApexDataLabels;
	plotOptions: ApexPlotOptions;
	yaxis: ApexYAxis;
	xaxis: ApexXAxis;
	fill: ApexFill;
	tooltip: ApexTooltip;
	stroke: ApexStroke;
	legend: ApexLegend;
};

@Component({
	selector: "app-p-dashboard",
	templateUrl: "./p-dashboard.component.html",
	styleUrls: ["./p-dashboard.component.scss"]
})
export class PDashboardComponent implements OnInit, OnDestroy {
	destroy$: Subject<boolean> = new Subject<boolean>();
	chartReady = false;
	@ViewChild("chart") chart!: ChartComponent;
	public chartOptions!: Partial<ChartOptions> | any;
	accountTypeFilterActive = false;
	periodFilterActive = false;

	data: any;
	user_init: any;
	toggleFilters = false;

	statistics_data: Array<any> = [];
	isLoading = false;
	productSubscription$ = this.financeService.productSubscription$;

	dashboardStatistics: any;
	currentAcademicYear: any;
	terms$: any;
	currentTerm: any;
	filterByYear = false;
	selectedAccountType: any;
	accountTypes: any;
	availablePeriods = [
		"TODAY",
		"YESTERDAY",
		"THIS_WEEK",
		"LAST_WEEK",
		"THIS_MONTH",
		"LAST_MONTH"
	];

	studentData: any = {};
	userRoles$: Observable<Role> = this.rolesService.roleSubject;
	financeStudents$?: Observable<FinanceStudent[]> = this.financeService.students$;
	stream?: any;

	constructor(
		private rolesService: RolesService,
		private financeService: FinanceService,
		private toastService: HotToastService,
		private translate: TranslateService
	) { }

	ngOnInit(): void {
		this.getAcademicYears();
		this.getAccountTypes();
		this.statistics_data = [];
		console.warn(this.statistics_data);

		this.getFinanceStatistics();
	}

	studentList: Array<any> = [];
	isLoadingBalances = false;
	getFeeBalanceByStream(streamId: number) {
		this.isLoadingBalances = true;
		this.toggleBalanceView(1);
		this.financeService.getFeeBalanceByStream(streamId).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp: any) => {
				console.warn("F resp >> ", resp);
				this.studentList = resp?.list;
			},
			error: err => { },
			complete: () => {
				this.isLoadingBalances = false;
			}
		});
	}

	ngOnDestroy() {
		this.destroy$.next(true);
		this.destroy$.unsubscribe();
	}


	intakeView = true;
	streamView = false;
	studentView = false;
	toggleBalanceView(view: number) {
		switch (view) {
		case 0:
			this.intakeView = true;
			this.streamView = false;
			this.studentView = false;
			break;
		case 1:
			this.intakeView = true;
			this.streamView = false;
			this.studentView = false;
			break;
		case 2:
			this.intakeView = false;
			this.streamView = false;
			this.studentView = true;
			break;

		default:
			this.intakeView = true;
			this.streamView = false;
			this.studentView = false;
			break;
		}
	}

	populateStudentList(event: any) {
		// this.toggleBalanceView(1);
		this.studentList = event?.resp?.list;
		this.stream = event?.stream;
		// this.streamData[event.intakeIndex].streams[event.streamIndex].intakeView = false;
		// this.streamData[event.intakeIndex].streams[event.streamIndex].streamView = true;
		// this.streamData[event.intakeIndex].streams[event.streamIndex].studentView = false;

		this.streamData[event.intakeIndex].streams.forEach((stream: any, i: number) => {
			if (i == event.streamIndex) {
				stream.streamView = true;
			} else {
				stream.streamView = false;
			}
		});

		// console.log(this.streamData[event.index])
	}


	selectedStudentAdmno="";
	populateStudentData(event: any) {
		// this.toggleBalanceView(2);


		this.studentData = event;
		console.log(this.studentData);
		this.selectedStudentAdmno = this.studentData.balanceSummary.admissionNo;
		const parentIndex = event.parentIndex;

		// this.streamData[parentIndex].intake.intakeView = false;
		// this.streamData[parentIndex].intake.streamView = false;
		// this.streamData[parentIndex].intake.studentView = true;

		this.streamData[parentIndex].streams[event.streamIndex].intakeView = false;
		this.streamData[parentIndex].streams[event.streamIndex].streamView = false;
		this.streamData[parentIndex].streams[event.streamIndex].studentView = true;

	}

	//Revieving student data from search student component
	onStudentData(event: any) {
		this.studentData = event;
	}

	//recieving stream data from search student component
	onStream(event: any) {
		//do something
	}

	showStudentView!: boolean;
	//recieve student found status component
	onStudentFound(event: any) {
		this.showStudentView = event;
	}

	closeStreamView(event: any) {
		const parentIndex = event.parentIndex;

		this.streamData[parentIndex].intake.intakeView = true;
		this.streamData[parentIndex].intake.streamView = false;
		this.streamData[parentIndex].intake.studentView = false;
	}

	closeStudentView(event: any) {
		const parentIndex = event.parentIndex;
		this.showStudentView = false;
		this.streamData[parentIndex].intake.intakeView = true;
		this.streamData[parentIndex].intake.streamView = false;
		this.streamData[parentIndex].intake.studentView = false;
	}

	getAccountTypes() {
		this.financeService.voteHeadCategories$.pipe(takeUntil(this.destroy$)).subscribe(
			resp => {
				this.accountTypes = resp.list.map(i => ({ ...i, name: String(i.name).toUpperCase().replace("ACCOUNT", "") }));
				// console.warn("this.accountTypes >> ", this.accountTypes);
				this.selectedAccountType = this.accountTypes[0].id;

				this.getMoneyInAndOut();

			}
		);
	}

	customSearchFn(term: string, item: FinanceStudent) {
		console.warn("term, item >>", term, item);
		term = term.toLowerCase();
		return item.studentNames.toLowerCase().indexOf(term) > -1 || item.admNo.includes(term);
	}

	getFinanceStatistics() {
		this.isLoading = true;
		this.financeService.getFinanceStatistics().pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp: any) => {
				this.dashboardStatistics = resp;
				this.statistics_data = resp?.collectionVsInvoiceList;
			},
			error: err => {
				console.error("getFinanceStatistics() Err>> ", err);
				const message = this.translate.instant("finance.schoolFinance.toastMessages.getFinanceStatsError");
				this.toastService.error(message);
				this.isLoading = false;
			},
			complete: () => {
				this.isLoading = false;
				this.getIntakeStreams();
			}
		});
	}

	streamData: any = [];
	getIntakeStreams() {
		let streamData: any = [];
		const intakeIds: any = [];

		for (const data of this.statistics_data) {
			intakeIds.push(data.intakeId);
		}

		this.financeService.getAllFeeBalanceByIntake(intakeIds).pipe(takeUntil(this.destroy$)).subscribe({
			next: (resp: any) => {
				streamData = resp;
			},
			error: err => {
				console.error(err);
			},
			complete: () => {
				for (const data of this.statistics_data) {
					data.intakeView = true;
					data.streamView = false;
					data.studentView = false;
					const found = streamData.collectionVsInvoiceList?.filter(sd => sd.intakeId === data.intakeId);
					this.streamData.push({ intake: data, streams: found });
				}
			}
		});
	}

	loadFeeBalanceByStream(stream: any, intakeIndex: any, streamIndex: any) {
		this.financeService.getFeeBalanceByStream(stream.streamId).subscribe({
			next: (resp: any) => {
				const obj: any = { stream: stream, resp: resp, intakeIndex: intakeIndex, streamIndex: streamIndex };
				this.populateStudentList(obj);
			},
			error: err => { },
			complete: () => {
				this.isLoadingBalances = false;
			}
		});
	}

	moneyIn: any;
	moneyOut: any;
	selectedPeriod = "TODAY";
	periodChange(period) {
		this.selectedPeriod = period;
		this.periodFilterActive = false;
		this.getMoneyInAndOut();
	}

	accountTypeChange(accountType) {
		this.selectedAccountType = accountType;
		this.accountTypeFilterActive = false;
		this.getMoneyInAndOut();
	}


	getMoneyInAndOut(): void {
		const period = this.selectedPeriod ? this.selectedPeriod : "THIS_WEEK";

		this.financeService.getMoneyInAndOut(this.selectedAccountType, period).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
			this.moneyIn = resp.moneyIn;
			this.moneyOut = resp.moneyOut;
		});
	}

	getDashboardStatisticsByTerm(termId?: any): void {
		this.currentTerm = termId;
		this.filterByYear = false;
		this.financeService.getStatisticsByTerm(termId).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
			this.dashboardStatistics = resp;
		});
		this.financeService.getRevenueVsExpenditureByTerm(termId).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
			this.loadChart(resp);
		});
	}

	getDashboardStatisticsByYear(id: number): void {
		this.currentTerm = "";
		this.filterByYear = true;

		this.currentAcademicYear = this.academicYears.find(year => id === year.id);
		this.financeService.getStatisticsByAcademicYear(this.currentAcademicYear.id).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
			this.dashboardStatistics = resp;
		});
		this.financeService.getRevenueVsExpenditureByAcademicYear(this.currentAcademicYear.id).pipe(takeUntil(this.destroy$)).subscribe((resp) => {
			this.loadChart(resp);
		});
		this.getTerms();
	}

	academicYears: Array<any> = [];
	getAcademicYears(): void {
		this.financeService.academicYears$.pipe(takeUntil(this.destroy$)).subscribe(
			(academicYears) => {
				if (academicYears?.list) {
					this.academicYears = academicYears.list;
					this.currentAcademicYear = academicYears.list[0];
					this.getDashboardStatisticsByYear(this.currentAcademicYear?.id);
				}
			}
		);
	}

	getTerms(): void {
		this.financeService.terms$.pipe(takeUntil(this.destroy$)).subscribe(
			terms => this.terms$ = terms.list.filter(t => t.academicYearId == this.currentAcademicYear.id)
		);
	}

	getRatio(stats: any) {
		return stats.invoiced ?
			(stats.collected / stats.invoiced) * 100 :
			(stats.collectedAmount / stats.invoicedAmount) * 100;
	}

	loadChart(data: any) {

		this.chartOptions = {
			series: [
				{
					data: data.map(d => d.revenue),

				},
				{
					data: data.map(d => d.expenditure)
				},
				{
					data: data.map(d => d.revenue - d.expenditure)
				}
			],
			chart: {
				type: "bar",
			},
			legend: {
				customLegendItems: ["Revenue", "Expenditure", "Surplus", "Deficit"],
				markers: {
					fillColors: [
						"#0FFF50",
						"#2B78F6",
						"#D8F01C",
						"#EB4923"
					]
				}
			},
			plotOptions: {
				bar: {
					horizontal: false,
					columnWidth: "55%"
				}
			},
			dataLabels: {
				enabled: false
			},
			stroke: {
				show: true,
				width: 2,
				colors: ["transparent"]
			},
			xaxis: {
				categories: data.map(t => t.termName)
			},
			yaxis: {
				title: {
					text: "Amount in KSH"
				},
				labels: {
					formatter: function (val) {
						return formatNumber(val / 1000000, "en", "1.0") + "M";
					}
				}
			},
			fill: {
				opacity: 1,
				colors: [
					"#0FFF50",
					"#2B78F6",
					function ({ value }) {
						if (value < 0) {
							return "#EB4923";
						} else {
							return "#D8F01C";
						}
					}
				]
			},
			tooltip: {
				y: {
					formatter: function (val) {
						return "KES " + formatNumber(val, "en", "1.0");
					}
				}
			}
		};


		this.chartReady = true;
	}

	formatPeriod(pr: any) {
		return pr.split("_").map(w => capitalize(w)).join(" ");
	}

	get currentAccTypeName() {
		return this.accountTypes?.find(acc => acc.id == this.selectedAccountType).name;
	}

}

//HELPER FUNCTIONS
function capitalize(word: any) {
	const lower = word.toLowerCase();
	return word.charAt(0).toUpperCase() + lower.slice(1);
}


