import { ComponentFixture, TestBed } from "@angular/core/testing";
import {NavBarComponent} from "./nav-bar.component";

describe("NavBarComponent", () => {
	let component: NavBarComponent;
	let fixture: ComponentFixture<NavBarComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ NavBarComponent ]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(NavBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});

	it("should output array of navigation title", function () {
		const result = component.splitStringIntoChunks(" Sample de'Navigation test test");
		const result2 = component.splitStringIntoChunks("Manage Classes");
		const result3 = component.splitStringIntoChunks("Add New Class");
		expect(result).toEqual(["Sample", "de'Navigation", "test test"]);
		expect(result2).toEqual(["Manage", "Classes"]);
		expect(result3).toEqual(["Add New", "Class"]);
	});
});
