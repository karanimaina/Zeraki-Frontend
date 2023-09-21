import { DebugElement } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AnalyticsGuineaTopViewComponent } from "./analytics-guinea-top-view.component";
import { By } from "@angular/platform-browser";

describe("AnalyticsGuineaTopViewComponent",()=>{

	let component:AnalyticsGuineaTopViewComponent;
	let fixture:ComponentFixture<AnalyticsGuineaTopViewComponent>;

	beforeEach( async ()=>{
		await TestBed.configureTestingModule({
			declarations:[AnalyticsGuineaTopViewComponent]
		}).compileComponents();
	});

	beforeEach(()=>{
		fixture = TestBed.createComponent(AnalyticsGuineaTopViewComponent);
		component = fixture.componentInstance;
	});

	it("should create component",()=>{
		expect(component).toBeTruthy();
	});

	it("should call ngOnInit()",()=>{
		const spy = spyOn(component,"ngOnInit");

		component.ngOnInit();

		expect(spy).toHaveBeenCalled();
	});

	it("change_selected_stream() should be called",()=>{
		const spy = spyOn(component,"change_selected_stream");

		component.change_selected_stream();

		expect(spy).toHaveBeenCalled();
	});

	it("should contain a div for displaying mentions and selected grade",()=>{
		const div:DebugElement = fixture.debugElement.query(By.css("div.row div.col-sm-3 div.box"));

		expect(div).toBeDefined();
	});

	it("should contain h3 with text grade inside div for mentions",()=>{
		const h3:HTMLElement = fixture.debugElement.query(By.css("div.row div.col-sm-3 div.box div.box-body h3")).nativeElement;
		fixture.detectChanges();

		expect(h3).toBeDefined();
		expect(h3.innerText).toContain("Grade");
	});

	it("should contain section with inside div for mentions",()=>{
		const section:DebugElement = fixture.debugElement.query(By.css("div.row div.col-sm-3 div.box div.box-body section"));

		expect(section).toBeDefined();
	});

	it("should contain section with class `text-muted` with inside div for mentions",()=>{
		const section:DebugElement = fixture.debugElement.query(By.css("div.row div.col-sm-3 div.box div.box-body section"));

		expect(section.classes["text-muted"]).toBeTruthy();
	});

	it("should contain section with three divs for mentions",()=>{
		const section:DebugElement[] = fixture.debugElement.queryAll(By.css("div.row div.col-sm-3 div.box div.box-body section div"));

		expect(section.length).toBe(3);
	});

	it("Should contain a section for graph",()=>{
		const graphDiv:DebugElement[] = fixture.debugElement.queryAll(By.css("div.row div.col-sm-6 div.box"));
		const html:HTMLElement = graphDiv[0].nativeElement;

		expect(html).toBeTruthy();
	});

	it("Should contain a section for graph",()=>{
		const graphDiv:DebugElement[] = fixture.debugElement.queryAll(By.css("div.row div.col-sm-6 div.box"));
		const html:HTMLElement = graphDiv[0].nativeElement;

		expect(html).toBeTruthy();
	});

	it("Should have a div with three select form fields",()=>{
		const graphDiv:DebugElement[] = fixture.debugElement.queryAll(By.css("div.row div.col-sm-6 div.box:last-child div.box-body div.row div.col-4"));


		expect(graphDiv.length).toBe(3);
	});


	it("should have a div for student reports",()=>{
		const el:DebugElement = fixture.debugElement.query(By.css("div.row div.col-sm-3:last-child"));

		expect(el).toBeTruthy();
	});

	it("should have a div for student reports with text `students`",()=>{
		const el:HTMLElement = fixture.debugElement.query(By.css("div.row div.col-sm-3:last-child div.fw-bolder")).nativeElement;

		expect(el.innerText).toContain("Students");
	});

	it("should have a div for student reports with three buttons",()=>{
		const el:DebugElement[] = fixture.debugElement.queryAll(By.css("div.row div.col-sm-3:last-child button"));

		expect(el.length).toBe(3);
	});



});