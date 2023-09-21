import { Component, OnInit } from "@angular/core";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { TimetableService } from "src/app/@core/services/timetable/timetable.service";

@Component({
	selector: "app-class-timetable",
	templateUrl: "./class-timetable.component.html",
	styleUrls: ["./class-timetable.component.scss"]
})
export class ClassTimetableComponent implements OnInit {

	class_error_message = "";
	select_form: any;
	select_stream = "";
	streams: any;
	selected_intake_stream: any[] = [];
	selected_school:any = "";
	loadingTable = true;
	loadingFailed = false;

	timetable_data: any = {};
	teacherHashMap = new Map();
	subjectHashMap = new Map();
	streamHashMap = new Map();
	timeslotHashMap = new Map();
	intakeHashMap = new Map();
	lessonHashMap = new Map();

	days: any[] = [
		{day: "mon", data: []},
		{day: "tue", data: []},
		{day: "wed", data: []},
		{day: "thu", data: []},
		{day: "fri", data: []}
	];
	timeslots_array: any[] = [];
	lessonContent: any;
	lesson_content: any;

	constructor(
    private ttService: TimetableService,
    private studentsService: StudentsService,
    private toastService: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnInit(): void {
		// this.streamList = this.ttService.getStreamList();
		forkJoin([
			this.studentsService.getFormStreams(false, true).pipe(catchError(e => of(e)))
		]).subscribe(([form_streams]) => {
			// console.warn("form_streams >> ", form_streams);
			this.streams = form_streams.intakes;
			this.controller();
		});
	}

	selectedForm():void { }

	controller() {
		if (this.streams.length > 0) {
			for (let a = 0; a < this.streams.length; a++) {
				const intake = this.streams[a];
				for (const iterator of this.streams) {
					if (!iterator.is_graduated) {
						this.select_form = iterator;
						// console.warn("iterator", iterator);
						// console.warn("select_form", this.select_form);
						break;
					}
				}
				this.form_change();
				// $('#select_form_stream').val($('#select_form_stream option:nth-child(1)').val());
				//check if intake has streams
				if (intake.streams.length > 0) {
					//set stream values
					this.select_stream = intake.streams[0].streamid;
					//call the function to load class timetable;
					this.getClassTimetableMethod(this.select_stream);
					//exit the loop
					break;
				}
			}
		}
	}

	loadClassTimeTable() {
		this.getClassTimetableMethod(this.select_stream);
	}

	form_change() {
		const stream = this.select_form;
		this.selected_intake_stream = stream.streams;
	}

	getSubjectTitle(subjectArrayIds: any) {
		const names: any[] = [];
		let color = "#EDF9EE";
		for (let a = 0; a < subjectArrayIds.length; a++) {
			const subject_id = subjectArrayIds[a];
			names.push(this.subjectHashMap.get(subject_id).shortName);
			color = this.subjectHashMap.get(subject_id).colorCode;

		}
		return {names: names, color: color};
	}

	//get teacher codes
	getTeacherCodes(teacherArrayIds: any) {
		const codes: any[] = [];
		for (let a = 0; a < teacherArrayIds.length; a++) {
			const teacher_id = teacherArrayIds[a];
			codes.push(this.teacherHashMap.get(teacher_id).code);
		}
		return codes.join(",");
	}

	getClassTimetableMethod(streamId: any) {
		this.loadingTable = true;
		this.ttService.getClassTimeTable(streamId).subscribe({
			next: (response: any) => {
				// let form_name = $('#select_form_intake').find(":selected").text();
				// let form_stream = $('#select_form_stream').find(":selected").text();

				console.log(this.select_stream);
				let streamName:any = "";
				this.select_form.streams.forEach((e:any) => {

					if(e.streamid == this.select_stream) { //console.log(e);
						streamName = e.name;
					}
				});
				this.selected_school = this.select_form.label + " " +streamName;
				this.loadingTable = false;
				this.loadingFailed = false;
				this.timetable_data = response;
				response.timeslotCategories.forEach((e: any) => {
					// console.log(e);

					if (e.timeslotCategory == "MAIN") {
						this.timetable_data.timeslots = e.timeslotsData;
					}
				});
				//////console.log(response);
				if (response.message !== undefined) {
					const errorMsg = this.translate.instant("timetable.classTimetable.toastMessages.loadWarning");
					this.toastService.warning(errorMsg);
				} else {
					//Create hasmaps for all the tables we get
					//++++++++++++++++++++++++
					this.teacherHashMap = new Map();
					this.subjectHashMap = new Map();
					this.streamHashMap = new Map();
					this.timeslotHashMap = new Map();
					this.intakeHashMap = new Map();
					this.lessonHashMap = new Map();
					this.days = [
						{day: "mon", data: []},
						{day: "tue", data: []},
						{day: "wed", data: []},
						{day: "thu", data: []},
						{day: "fri", data: []}
					];
					this.timeslots_array = [];
					for (let a = 0; a < this.timetable_data.teachers.length; a++) {
						const t = this.timetable_data.teachers[a];
						this.teacherHashMap.set(t.teacherId, t);
					}

					for (let a = 0; a < this.timetable_data.subjects.length; a++) {
						const t = this.timetable_data.subjects[a];
						this.subjectHashMap.set(t.subjectId, t);
					}

					for (let a = 0; a < this.timetable_data.streams.length; a++) {
						const t = this.timetable_data.streams[a];
						this.streamHashMap.set(t.streamId, t);
					}


					for (let a = 0; a < this.timetable_data.timeslots.length; a++) {
						const t = this.timetable_data.timeslots[a];
						this.timeslotHashMap.set(t.timeslotId, t);
					}

					for (let a = 0; a < this.timetable_data.intake.length; a++) {
						const t = this.timetable_data.intake[a];
						this.intakeHashMap.set(t.intakeId, t);
					}

					for (let a = 0; a < this.timetable_data.lessons.length; a++) {
						const t = this.timetable_data.lessons[a];
						this.lessonHashMap.set(t.timeslotId, t);
					}
					// console.log({teacherMap:teacherHashMap});
					// console.log({subjectMap:subjectHashMap});
					// console.log({streamMap:streamHashMap});
					// console.log({timeMap:timeslotHashMap});
					// console.log({lessonHashMap:lessonHashMap});
					//++++++++++++++++++++++++
					//let lessons = this.timetable_data.lessons;
					for (let a = 0; a < this.timetable_data.timeslots.length; a++) {
						const timeslot = this.timetable_data.timeslots[a];
						const time_holders = this.timetable_data.timeslots[a];

						this.lessonContent = {subjectCodes: {color: "#f5f5f5"}};
						if (this.lessonHashMap.get(timeslot.timeslotId) !== undefined) {
							const current_lesson = this.lessonHashMap.get(timeslot.timeslotId);
							this.lesson_content = this.lessonHashMap.get(timeslot.timeslotId);
							//get the teacher data
							this.lessonContent.teacherCodes = this.getTeacherCodes(current_lesson.teacherIds);
							this.lessonContent.subjectCodes = this.getSubjectTitle(current_lesson.subjectIds);
							//delete unecessary elements
							delete this.lessonContent.teacherIds;
							delete this.lessonContent.streamIds;
						}

						timeslot.lessonContent = this.lessonContent;
						const ttype = timeslot.type;
						const begin_index = (timeslot.dayNumber - 1) % ttype.length;

						if (ttype !== "CLASS") {

							const end_index = (timeslot.dayNumber) % (ttype.length + 1);
							timeslot.lessonContent.content = ttype.charAt(begin_index);
							timeslot.lessonContent.subjectCodes.color = "#EDF9EE";

						}
						this.days[begin_index].data.push(timeslot);
						time_holders.time = time_holders.startTime.substring(0, 5) + " - " + time_holders.endTime.substring(0, 5);
						if (timeslot.dayNumber == 1) {
							this.timeslots_array.push(time_holders);
						}
					}
				}
			},
			error: err => {
				console.error(err);
				this.loadingTable = true;
				this.loadingFailed = true;
				this.class_error_message = err.error.message;
			}
		});

	}


}
