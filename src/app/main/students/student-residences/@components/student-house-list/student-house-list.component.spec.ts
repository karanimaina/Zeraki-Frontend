import { StudentHouseListComponent } from "./student-house-list.component";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { TranslateModule } from "@ngx-translate/core";
import { HttpClientModule } from "@angular/common/http";
import { ActivatedRoute } from "@angular/router";
import {PrintoutsService} from "../../../../../@core/services/printouts/printouts.service";
import {SchoolService} from "../../../../../@core/shared/services/school/school.service";

class ActivatedRouteStub {
	static snapshot = {
		params: {
			id: 2
		}
	};
}

describe("StudentHouseListComponent", () => {
	let component: StudentHouseListComponent;
	let fixture: ComponentFixture<StudentHouseListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [StudentHouseListComponent],
			imports: [TranslateModule, HttpClientModule],
			providers: [
				PrintoutsService,
				SchoolService,
				TranslateModule,
				{
					provide: ActivatedRoute,
					useClass: ActivatedRouteStub
				}
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StudentHouseListComponent);
		component = fixture.componentInstance;
	});

	it("should create component", () => {
		expect(component).toBeTruthy();
	});
});
