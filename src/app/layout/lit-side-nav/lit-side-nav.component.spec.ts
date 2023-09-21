import { ComponentFixture, TestBed } from "@angular/core/testing";
import { AuthService } from "src/app/@core/services/auth/auth.service";
import { LitSideNavComponent } from "./lit-side-nav.component";

describe("LitSideNavComponent", () => {
	let component: LitSideNavComponent;
	let fixture: ComponentFixture<LitSideNavComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ LitSideNavComponent ],
			providers:[AuthService]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(LitSideNavComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});
});
