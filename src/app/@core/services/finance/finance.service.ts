import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { Observable, ReplaySubject } from "rxjs";
import { map, shareReplay, take } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { StkData } from "../../models/finance/stk";
import { Intake } from "../../models/intake/intake";

@Injectable({
	providedIn: "root"
})
export class FinanceService {
	public studentInfo$: ReplaySubject<any> = new ReplaySubject();
	public students$ = this.getFinanceStudents().pipe(shareReplay());
	public academicYears$ = this.getAcademicYears().pipe(shareReplay());
	public terms$ = this.getTerms().pipe(shareReplay());
	public voteHeads$ = this.getVoteHeads().pipe(shareReplay());
	public groups$ = this.getGroups().pipe(shareReplay());
	public intakes$ = this.getIntakes().pipe(shareReplay());
	public streams$ = this.getStreams().pipe(shareReplay());
	public productSubscription$ = this.getProductSubscription().pipe(shareReplay());
	public voteHeadCategories$ = this.getVoteHeadCategories().pipe(shareReplay());


	constructor(private http: HttpClient, private toastService: HotToastService, private translate: TranslateService) { }

	/**
	 * Resets all cached/shared observables
	 */
	resetAllCaches(): void {
		this.resetAcademicYears();
		this.resetStudents();
		this.resetTerms();
		this.resetVoteHeads();
		this.resetGroups();
		this.resetIntakes();
		this.resetStreams();
		this.resetProductSubscription();
		this.resetVoteHeadCategories();
	}

	/**
	 * Sets the finance user using the analytics admission number
	 */
	setStudent(admNo?: string) {
		this.getFeeBalanceByAdm(admNo).pipe(take(1)).subscribe({
			next: (resp: any) => {
				this.studentInfo$.next(resp?.list[0]);
			},
			error: err => {
				console.error("getFinanceStatistics() Err>> ", err);
				const message = this.translate.instant("finance.schoolFinance.toastMessages.getFinanceStatsError");
				this.toastService.error(message);
			},
		});
	}

	/**
	 * Gets a list of all vote head categories
	 * @returns an Observable with a list of all vote head categories
	 */
	getVoteHeadCategories(): Observable<any> {
		return this.http.get(`${environment.financeApiUrl}/vote_head_categories`, {
			params: { pageSize: 100000 },
		});
	}

	/**
	 * Resets cached vote head categories
	 */
	resetVoteHeadCategories(): void {
		this.voteHeadCategories$ = this.getVoteHeadCategories().pipe(shareReplay());
	}

	getMoneyInAndOut(voteHeadCategoryId, period: any): Observable<any> {
		const params = { voteHeadCategoryId, period };
		return this.http.get(`${environment.financeApiUrl}/dashboard`, { params });
	}

	/**
	 * Gets the finance product subscription type ( 'LITE', 'FULL', 'BASIC' )
	 * @returns An observable of the product subscription type
	 */
	getProductSubscription(): Observable<any> {
		return this.http.get(`${environment.financeApiUrl}/school_settings/product_subscription`);
	}

	/**
	 * Resets cached product subscription
	 */
	resetProductSubscription(): void {
		this.productSubscription$ = this.getProductSubscription().pipe(shareReplay());
	}

	getStatisticsByTerm(termId?: any): Observable<any> {
		const params = { termId };
		return this.http.get(`${environment.financeApiUrl}/dashboard`, { params });
	}

	getRevenueVsExpenditureByTerm(termId?: any): Observable<any> {
		const params = { termId };
		return this.http.get(`${environment.financeApiUrl}/dashboard/snapshot`, { params });
	}

	getRevenueVsExpenditureByAcademicYear(academicYearId?: any): Observable<any> {
		const params = { academicYearId };
		return this.http.get(`${environment.financeApiUrl}/dashboard/snapshot`, { params });
	}

	getStatisticsByAcademicYear(academicYearId?: any): Observable<any> {
		const params = { academicYearId };
		return this.http.get(`${environment.financeApiUrl}/dashboard`, { params });
	}

	getFinanceStatistics() {
		return this.http.get(`${environment.financeApiUrl}/dashboard`);
	}

	getFeeBalanceByAmount(amount: any, page = 1, above = true) {
		if (above) {
			return this.http.get(`${environment.financeApiUrl}/dashboard/balances?page=${page}&pageSize=20&amountAbove=${amount}`);
		} else {
			return this.http.get(`${environment.financeApiUrl}/dashboard/balances?page=${page}&pageSize=20&amountBelow=${amount}`);
		}
	}

	getSingleFeeBalance(studentId: number) {
		return this.http.get(`${environment.financeApiUrl}/dashboard/balances?studentId=${studentId}`);
	}

	getFeeBalanceByAdm(admno: any) {
		return this.http.get(`${environment.financeApiUrl}/dashboard/balances?admissionNo=${admno}`);
	}

	getStdCollections(studentId: number, page = 1) {
		return this.http.get(`${environment.financeApiUrl}/collections/?page=${page}&pageSize=20&studentId=${studentId}`);
	}

	getStdPledge(studentId: number, page = 1) {
		return this.http.get(`${environment.financeApiUrl}/pledges/?page=${page}&pageSize=100000&student_id=${studentId}`);
	}

	getStdReversal(page = 1) {
		return this.http.get(`${environment.financeApiUrl}/reversal_reasons/?page=${page}&pageSize=1000`);
	}

	getStudStatements(studId: number, page = 1) {
		return this.http.get(`${environment.financeApiUrl}/statements/?studentId=${studId}&page=${page}&pageSize=20`);
	}

	getFeeBalanceByStudentId(stud_id: any) {
		return this.http.get(`${environment.financeApiUrl}/dashboard/balances?studentId=${stud_id}`);
	}

	getFeeBalanceByIntake(intakeId: number, streamId?: number, page = 1) {
		if (intakeId && streamId) {
			return this.http.get(`${environment.financeApiUrl}/dashboard/balances?page=${page}&pageSize=50&intakeId=${intakeId}&streamId=${streamId}`);
		}
		return this.http.get(`${environment.financeApiUrl}/dashboard?intakeId=${intakeId}`);

	}

	getAllFeeBalanceByIntake(intakeIds: Array<number>) {
		const params = intakeIds.join(",");

		// console.warn("intakeIds >> ", params);
		return this.http.get(`${environment.financeApiUrl}/dashboard?intakeIds=${params}`);

	}

	getFeeBalanceByStream(streamId: number, page = 1) {
		return this.http.get(`${environment.financeApiUrl}/dashboard/balances?page=${page}&pageSize=50&streamId=${streamId}`);
	}

	getFeeStructures(yearId: number, studentId?: number): Observable<any> {
		let params = `?year=${yearId}`;
		if (studentId) params += `&studentId=${studentId}`;

		return this.http.get(`${environment.financeApiUrl}/fee_structures/${params}`);
	}

	getFeeStructure(feeStructureId?: number): Observable<any> {
		return this.http.get(`${environment.financeApiUrl}/fee_structures/${feeStructureId}`);
	}

	/**
	 * Gets a list of all students
	 * @returns an Observable with a list of all students
	 */
	getFinanceStudents(): Observable<any> {
		return this.http.get(`${environment.financeApiUrl}/students`);
	}

	/**
	 * Resets cached students
	 */
	resetStudents(): void {
		this.students$ = this.getFinanceStudents().pipe(shareReplay());
	}

	/**
	 * Gets a list of all academic years
	 * @returns an Observable with a list of all academic years
	 */
	getAcademicYears(): Observable<any> {
		return this.http.get(`${environment.financeApiUrl}/academic-years`, {
			params: { pageSize: 10 },
		});
	}

	/**
	 * Resets cached academic years
	 */
	resetAcademicYears(): void {
		this.academicYears$ = this.getAcademicYears().pipe(shareReplay());
	}

	/**
	 * Gets the current academic year
	 * @returns An observable of the current academic year
	 */
	getCurrentAcademicYear(): Observable<any> {
		const today = new Date().getTime();
		return this.academicYears$.pipe(
			map((academicYears: any) => {
				const currentAcademicYear = academicYears.list.find((year: any) => {
					return year.beginDate < today && year.endDate > today;
				});
				return currentAcademicYear || academicYears.list[0];
			})
		);
	}

	/**
	 * Gets a list of terms
	 * @returns an Observable with a list of all terms
	 */
	getTerms(): Observable<any> {
		return this.http.get(`${environment.financeApiUrl}/terms`, {
			params: { pageSize: 10 },
		});
	}

	/**
	 * Resets cached terms
	 */
	resetTerms(): void {
		this.terms$ = this.getTerms().pipe(shareReplay());
	}

	/**
	 * Gets a list of all vote heads
	 * @returns an Observable with a list of all vote heads
	 */
	getVoteHeads(): Observable<any> {
		return this.http.get<any>(`${environment.financeApiUrl}/vote_heads`, {
			params: { pageSize: 1000 },
		});
	}

	/**
	 * Resets cached vote heads
	 */
	resetVoteHeads(): void {
		this.voteHeads$ = this.getVoteHeads().pipe(shareReplay());
	}

	/**
	 * Gets a list of all groups
	 * @returns an Observable with a list of all groups
	 */
	getGroups(): Observable<any> {
		return this.http.get(`${environment.financeApiUrl}/fee_structure_groups`, {
			params: { pageSize: 1000 },
		});
	}

	/**
	 * Resets cached groups
	 */
	resetGroups(): void {
		this.groups$ = this.getGroups().pipe(shareReplay());
	}

	/**
	 * Gets a list of all intakes
	 * @returns an Observable with a list of all intakes
	 */
	getIntakes(): Observable<Intake[]> {
		return this.http.get<Intake[]>(`${environment.financeApiUrl}/intakes`, {
			params: { pageSize: 1000 },
		});
	}

	/**
	 * Resets cached intakes
	 */
	resetIntakes(): void {
		this.intakes$ = this.getIntakes().pipe(shareReplay());
	}

	/**
	 * Gets a list of all streams
	 * @returns an Observable with a list of all streams
	 */
	getStreams(): Observable<any> {
		return this.http.get<any>(`${environment.financeApiUrl}/streams`, {
			params: { pageSize: 1000 },
		});
	}

	/**
	 * Resets cached streams
	 */
	resetStreams(): void {
		this.streams$ = this.getStreams().pipe(shareReplay());
	}

	/**
	 * Get fintech Stk Data
	 */
	getStkData() {
		return this.http.get(`${environment.financeApiUrl}/payment_integrations`);
	}

	generateStk(data: StkData) {
		const apiUrl = data.apiUrl;
		delete data.apiUrl;
		return this.http.post(`${apiUrl}`, data);
	}






	getFeeBalanceByName(name: string) {
		return this.http.get(`${environment.financeApiUrl}/z_finance/principal/balance?name=${name}`);
	}

	getFeeBalanceByAdmNo(admno: any) {
		return this.http.get(`${environment.financeApiUrl}/z_finance/principal/balance?admissionNo=${admno}`);
	}

	getSingleFeeStructure(admno: number) {
		return this.http.get(`${environment.apiurl}/z_finance/principal/structure/${admno}`);
	}

	getSingleFeeStatement(admno: number) {
		return this.http.get(`${environment.financeApiUrl}/z_finance/principal/statement/${admno}`);
	}

}
