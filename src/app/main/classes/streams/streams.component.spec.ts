import { HttpClientModule } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { DataService } from "src/app/@core/shared/services/data/data.service";

import { StreamsComponent } from "./streams.component";

import {of, throwError} from "rxjs";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

class ActivatedRouteStub {
	snapshot: any = {
		paramMap: {
			get: (param: string) => {
				return "1";
			}
		}
	};
}

describe("StreamsComponent", () => {
	let component: StreamsComponent;
	let fixture: ComponentFixture<StreamsComponent>;
	let schoolTypeData:Partial<SchoolTypeData>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [StreamsComponent],
			imports: [HttpClientModule, TranslateModule],
			providers: [DataService, ClassesService, TranslateService, HotToastService, Location,
				{ provide: ActivatedRoute, useClass: ActivatedRouteStub }]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(StreamsComponent);
		component = fixture.componentInstance;
		schoolTypeData = {
			compulsory_subject_int_codes: [],
			current_forms_list: [],
			first_possible_form: 0,
			formoryear: "",
			graduated_forms_list: [],
			isIgcse: false,
			isKcpePrimarySchool: false,
			isKcseSchool: false,
			isOLevelSchool: false,
			isGuineaSchool: false,
			last_possible_form: 0,
			minSubjects: 0,
			possible_forms_list: [],
			logo: ""
		};
	});

	it("should create", () => {
		expect(component).toBeTruthy();
	});

	it("should call ngOnInit()",()=>{
		const spy = spyOn(component,"ngOnInit");

		component.ngOnInit();

		expect(spy).toHaveBeenCalled();
	});

	it("ngOnInit() should call getStreams() if routeId is defined",()=>{
		component.routeId = 1;
		const spy = spyOn(component,"getStreams");

		component.ngOnInit();

		expect(spy).toHaveBeenCalled();
	});

	it("ngOnInit() should initialize schoolTypeData Object",()=>{
		const dataService:DataService = fixture.debugElement.injector.get(DataService);
		dataService.schoolData.next(<SchoolTypeData>schoolTypeData);

		component.ngOnInit();

		expect(component.schoolTypeData).toEqual(schoolTypeData);
	});

	it("getStream() should load streams and initialize streamObj",()=>{
		const classesService:ClassesService = fixture.debugElement.injector.get(ClassesService);
		const streamsResponse = [1,2,3];
		spyOn(classesService,"getStreams").and.returnValue(of(streamsResponse));

		component.getStreams(1);

		expect(component.streamsObj).toEqual(streamsResponse);
	});

	it("assignClassTeacher() should assign class teacher and on success response display success alert",()=>{
		const streamId = 1;
		const selectedTeacher = "Teacher Doe";
		const classesService:ClassesService = fixture.debugElement.injector.get(ClassesService);
		spyOn(classesService,"assignClassTeacher").and.returnValue(of(["success"]));
		const toastService:HotToastService = fixture.debugElement.injector.get(HotToastService);
		const spy = spyOn(toastService,"success");

		component.assignClassTeacher(streamId,selectedTeacher);

		expect(spy).toHaveBeenCalled();
	});

	it("saveStreamName() should be able to add a new stream",()=>{
		const stream = "stream name";
		const classesService:ClassesService = fixture.debugElement.injector.get(ClassesService);
		spyOn(classesService,"save_streamName").and.returnValue(of([]));
		const toastService:HotToastService = fixture.debugElement.injector.get(HotToastService);

		const spy = spyOn(toastService,"success");

		component.saveStreamName(stream);

		expect(spy).toHaveBeenCalled();
	});

	it("saveStreamName() should display error message if unable to add new stream",()=>{
		const stream = "stream name";
		const classesService:ClassesService = fixture.debugElement.injector.get(ClassesService);
		spyOn(classesService,"save_streamName").and.returnValue(throwError("error"));
		const toastService:HotToastService = fixture.debugElement.injector.get(HotToastService);

		const spy = spyOn(toastService,"error");

		component.saveStreamName(stream);

		expect(spy).toHaveBeenCalledWith("error");
	});

	it("removeClassTeacher() should remove class teacher form stream id",()=>{
		const streamId = 1;
		const message="rights revoked";
		const classesService:ClassesService = fixture.debugElement.injector.get(ClassesService);
		spyOn(classesService,"save_streamName").and.returnValue(of(message));
		const toastService:HotToastService = fixture.debugElement.injector.get(HotToastService);
		const spy = spyOn(toastService,"success");

		component.removeClassTeacher(streamId);

		expect(spy).toHaveBeenCalledWith(message);
	});

});
