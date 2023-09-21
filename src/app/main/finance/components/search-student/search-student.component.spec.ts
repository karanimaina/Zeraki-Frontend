import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormControl, FormsModule } from "@angular/forms";
import { of } from "rxjs";
import { NgSelectModule } from "@ng-select/ng-select";
import { TranslateModule } from "@ngx-translate/core";
import { NgApexchartsModule } from "ng-apexcharts";
import { SharedModule } from "src/app/@core/shared/shared.module";
import { FinanceRoutingModule } from "../../finance-routing.module";
import { SearchStudentComponent } from "./search-student.component";
import { By } from "@angular/platform-browser";
import { DebugElement } from "@angular/core";
import {FinanceService} from "../../../../@core/services/finance/finance.service";

describe("SearchStudentComponent", () => {
	let component: SearchStudentComponent;
	let fixture: ComponentFixture<SearchStudentComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientModule,
				FormsModule,
				SharedModule,
				FinanceRoutingModule,
				NgApexchartsModule,
				NgSelectModule,
				TranslateModule.forRoot()
			],
			declarations:[SearchStudentComponent],
			providers:[FinanceService]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(SearchStudentComponent);
		component = fixture.componentInstance;
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});

	describe("Component Logic Tests",()=>{

		it("search(searchKey: NgModel) should be callable",()=>{
			const spy = spyOn(component,"search");
			const ngModel:any =  new FormControl("");
			component.search(ngModel);

			expect(spy).toHaveBeenCalledWith(ngModel);
		});

		it("search(searchKey:NgModel) should set isSbumitted to false",()=>{
			component.isSubmitted = false;

			const ngModel:any = new FormControl("");
			component.search(ngModel);

			expect(component.isSubmitted).toBeFalse();
		});

		it("search(searchKey:NgModel) shouldreturn searchKey is invalid",()=>{
			const ngModel:any = new FormControl("");
			const spy = spyOn(component,"searchStudent");

			component.search(ngModel);

			expect(spy).not.toHaveBeenCalled();
		});

		it("search(searchKey:NgModel) shouldreturn searchKey contains characters is invalid",()=>{
			const ngModel:any = new FormControl("abcd");
			const spy = spyOn(component,"searchStudent");

			component.search(ngModel);

			expect(spy).toHaveBeenCalled();
		});

		it("search(searchKey:NgModel) should call searchStudent if searchKey is valid",()=>{
			const ngModel:any = new FormControl("1234");
			const spy = spyOn(component,"searchStudent");

			component.search(ngModel);

			expect(spy).toHaveBeenCalledWith("1234");
		});

		it("searchStudent(student:any) should search student and call getStudentData on success response",()=>{
			const student = 1233;
			const response = {list:[{id:1}]};
			const service:FinanceService = fixture.debugElement.injector.get(FinanceService);
			spyOn(service,"getFeeBalanceByAdm").and.returnValue(of(response));
			const spyGetStudentData = spyOn(component,"getStudentData");

			component.searchStudent(student);

			expect(spyGetStudentData).toHaveBeenCalled();
		});

		it("searchStudent(student:any) should reset isSubmitted,studentFound and value when no data was served",()=>{
			const student = 1233;
			const response = {list:[]};

			component.isSubmitted = false;
			component.studentFound = false;
			component.value = "";

			const service:FinanceService = fixture.debugElement.injector.get(FinanceService);
			spyOn(service,"getFeeBalanceByAdm").and.returnValue(of(response));

			component.searchStudent(student);

			expect(component.isSubmitted).toBeTrue();
			expect(component.studentFound).not.toBeTrue();
			expect(component.value).toEqual(student);

		});

		it("getStudentData(student_id:number) should fetch fee balances,student statements and collections and emit studentDataEvt and studentFoundEvt on success response",()=>{
			const student_id = 1234;
			const response = [{list:["1"]},{list:["2"]},{list:"1"}];
			let studentDataEvt = null;
			let studentFoundEvt = null;

			component.studentDataEvt.subscribe(e=>{
				studentDataEvt = e;
			});
			component.studentFoundEvt.subscribe(e=>{
				studentFoundEvt = e;
			});
			const s = spyOn(component,"loadStudentInfoAsFork").and.returnValue(of(response));

			component.getStudentData(student_id);

			expect(s).toHaveBeenCalledWith(student_id);

			expect(studentDataEvt).toBeTruthy();
			expect(studentFoundEvt).toBeTruthy();
		});

		it("clear() should reset the value of st",()=>{
			component.st = "John Doe";

			component.clear();

			expect(component.st).toEqual("");
		});

	});
	describe("Component Template Tests",()=>{
		it("Should have a div with class `form-group`",()=>{
			const div:DebugElement = fixture.debugElement.query(By.css(".form-group"));

			expect(div).toBeTruthy();
		});

		it("should NOT display div with text `no student found` when search results is empty",()=>{
			component.studentFound = true;
			component.isSubmitted = false;
			const div:DebugElement = fixture.debugElement.query(By.css("div.form-group div:nth-child(2) div div"));

			fixture.detectChanges();

			expect(div).toBeNull();
		});

		it("should display div with text `no student found` when search results is empty",()=>{
			component.studentFound = false;
			component.isSubmitted = true;
			fixture.detectChanges();
			const div:DebugElement = fixture.debugElement.query(By.css(".form-group div:nth-child(2) div div"));

			expect(div).not.toBeNull();
		});

		it("should display div with text `no student found` when search results is empty",()=>{
			component.studentFound = false;
			component.isSubmitted = true;
			fixture.detectChanges();
			const div:DebugElement = fixture.debugElement.query(By.css(".form-group div:nth-child(2) div div"));

			expect(div.nativeElement.innerText).toContain("No student found");
		});
	});
});
