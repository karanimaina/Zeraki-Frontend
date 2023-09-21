import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MeritListComponent } from "./merit-list.component";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { DataService } from "../../../@core/shared/services/data/data.service";
import { HttpClientModule } from "@angular/common/http";
import { StudentsService } from "../../../@core/services/student/students.service";
import { UserService } from "../../../@core/shared/services/user/user.service";
import { PrintoutsService } from "../../../@core/services/printouts/printouts.service";
import { RolesService } from "../../../@core/shared/services/role/roles.service";
import { HotToastService } from "@ngneat/hot-toast";
import { SchoolService } from "../../../@core/shared/services/school/school.service";
import { ResponseHandlerService } from "../../../@core/shared/services/response-handler/response-handler.service";
import { Observable } from "rxjs";
import { ActivatedRoute } from "@angular/router";

class ActivatedRouteStub {
	activatedRoute = {
		queryParams: new Observable(subscriber => {
			let params = {
				intakeid: 1,
				streamid: 1,
				seriesid: 1,
				egroupid: 1,
				most_improved: 1
			}
		})
	}
}

describe("MeritListComponent", () => {

	let component: MeritListComponent;
	let fixture: ComponentFixture<MeritListComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [MeritListComponent],
			imports: [TranslateModule, HttpClientModule],
			providers: [
				DataService,
				StudentsService,
				UserService,
				PrintoutsService,
				RolesService,
				HotToastService,
				TranslateService,
				SchoolService,
				ResponseHandlerService,
				{ provider: ActivatedRoute, useClass: ActivatedRouteStub }
			]
		}).compileComponents();
	})

	beforeEach(() => {
		fixture = TestBed.createComponent(MeritListComponent);
		component = fixture.componentInstance;
	})


	it("Should create component", () => {
		expect(component).toBeTruthy()
	})




});
