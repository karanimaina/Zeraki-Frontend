import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, of } from "rxjs";
import { catchError } from "rxjs/operators";
import { StudentsService } from "src/app/@core/services/student/students.service";
import { TimetableService } from "src/app/@core/services/timetable/timetable.service";
import { UserService } from "src/app/@core/shared/services/user/user.service";

@Component({
	selector: "app-teacher-timetable",
	templateUrl: "./teacher-timetable.component.html",
	styleUrls: ["./teacher-timetable.component.scss"]
})
export class TeacherTimetableComponent implements OnInit {
	teacher_error_message = "";
	selected_teacher = "";
	loadingTable = true;
	loadingFailed = false;
	teachers: any;
	user_info: any;
	teacher: any;
	timetable_data: any = {};
	teacherHashMap = new Map();
	subjectHashMap = new Map();
	streamHashMap = new Map();
	timeslotHashMap = new Map();
	intakeHashMap = new Map();
	lessonHashMap = new Map();
	days: any = [
		{ day: "mon", data: [] },
		{ day: "tue", data: [] },
		{ day: "wed", data: [] },
		{ day: "thu", data: [] },
		{ day: "fri", data: [] }
	];
	timeslots_array: any[] = [];
	lessonContent: any = {};
	lesson_content: any;
	userid?: number;
	form_streams: any;

	constructor(
    private timetableService: TimetableService,
    private studentsService: StudentsService,
    private userService: UserService,
    private toastService: HotToastService,
    private translate: TranslateService,
	) { }

	ngOnInit(): void {
		forkJoin([
			this.userService.userInfoSubject.pipe(catchError(e => of(e))),
			this.timetableService.getTeachers().pipe(catchError(e => of(e))),
			this.studentsService.getFormStreams(false, true).pipe(catchError(e => of(e)))
		]).subscribe(([user_info, teachers, form_streams]) => {
			console.warn("user_info >> ", user_info);
			console.warn("teachers >> ", teachers);
			console.warn("form_streams >> ", form_streams);
			this.user_info = user_info;
			this.teachers = teachers;
			this.form_streams = form_streams;
			this.controller();
		});
	}

	controller() {
		this.selected_teacher = this.user_info.userid;
		this.teacher = this.getTeacher(this.selected_teacher);
		this.showTeacherTimetable(this.selected_teacher);
	}

	showTeacherTimetable(model: any) {
		//TO DO : FIX RELOADING FOR SAME TEACHER!
		// DO THE SAME FOR CLASSES
		this.selected_teacher = model;
		this.teacher = this.getTeacher(this.selected_teacher);
		this.getTeacherTimetable(this.selected_teacher);
		//
	}
	showTeacherTimetableClick(form:NgForm) {
		this.showTeacherTimetable(form.value.selected_teacher);
	}

	getSubjectTitle(subjectArrayIds: any) {
		const names: any[] = [];
		let color = "#EDF9EE";
		for (let a = 0; a < subjectArrayIds.length; a++) {
			const subject_id = subjectArrayIds[a];
			names.push(this.subjectHashMap.get(subject_id).shortName);
			color = this.subjectHashMap.get(subject_id).colorCode;

		}
		return { names: names, color: color };
	}

	getTeacherCodes(teacherArrayIds: any) {
		//only display tacher codes if there are more than one teacher in teacherArrayIds
		if (teacherArrayIds.length > 1) {
			const codes: any[] = [];
			for (let a = 0; a < teacherArrayIds.length; a++) {
				const teacher_id = teacherArrayIds[a];
				codes.push(this.teacherHashMap.get(teacher_id).code);
			}
			return codes.join(",");
		} else {
			return "";
		}

	}

	getStreams(streamArrayIds: any) {
		const codes: any[] = [];
		for (let a = 0; a < streamArrayIds.length; a++) {
			const stream_id = streamArrayIds[a];

			codes.push(this.intakeHashMap.get(this.streamHashMap.get(stream_id).intakeId).levelOfStudy + "" + this.streamHashMap.get(stream_id).name.substring(0, 1));
		}
		return codes.join(",");
	}

	getTeacherTimetable(userId: any) {
		this.loadingTable = true;
		this.loadingFailed = false;
		console.log("id " + userId);
		this.timetableService.getTeacherTimeTable(userId).subscribe({
			next: (response: any) => {
				console.warn("Response >> ", response);
				if (response.message !== undefined) {
					console.log("response.message !== undefined");
				} else {
					this.loadingTable = false;
					this.timetable_data = response;
					// timeslotCategories[0]

					response.timeslotCategories.forEach((e: any) => {
						// console.log(e);

						if (e.timeslotCategory == "MAIN") {
							this.timetable_data.timeslots = e.timeslotsData;
						}
					});
					// console.log(response);
					//Create hasmaps for all the tables we get
					//++++++++++++++++++++++++
					this.teacherHashMap = new Map();
					this.subjectHashMap = new Map();
					this.streamHashMap = new Map();
					this.timeslotHashMap = new Map();
					this.intakeHashMap = new Map();
					this.lessonHashMap = new Map();
					this.days = [
						{ day: "mon", data: [] },
						{ day: "tue", data: [] },
						{ day: "wed", data: [] },
						{ day: "thu", data: [] },
						{ day: "fri", data: [] }
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
					for (let a = 0; a < this.timetable_data.length; a++) {
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
					//////console.log({teacherMap:teacherHashMap});
					//////console.log({subjectMap:subjectHashMap});
					//////console.log({streamMap:streamHashMap});
					//////console.log({timeMap:timeslotHashMap});
					//////console.log({lessonHashMap:lessonHashMap});
					//++++++++++++++++++++++++
					//let lessons = this.timetable_data.lessons;
					for (let a = 0; a < this.timetable_data.timeslots.length; a++) {
						const timeslot = this.timetable_data.timeslots[a];
						const time_holders = this.timetable_data.timeslots[a];

						this.lessonContent = { subjectCodes: { color: "#f5f5f5" } };
						if (this.lessonHashMap.get(timeslot.timeslotId) !== undefined) {
							const current_lesson = this.lessonHashMap.get(timeslot.timeslotId);
							this.lesson_content = this.lessonHashMap.get(timeslot.timeslotId);
							//get the teacher data
							this.lessonContent.teacherCodes = this.getTeacherCodes(current_lesson.teacherIds);
							this.lessonContent.subjectCodes = this.getSubjectTitle(current_lesson.subjectIds);
							this.lessonContent.streamCodes = this.getStreams(current_lesson.streamIds);
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
				// utilityService.notifyWarning("Unable to load timetable, please check your internet connection then try again");
				console.error("Error >> ", err);
				this.teacher_error_message = err.error.message;
				this.loadingTable = true;
				this.loadingFailed = true;
				const message = this.translate.instant("timetable.teacherTimetable.toastMessages.getTimetableError");
				this.toastService.error(message);
			}
		});
	}

	getTeacher(userid: any) {
		let teacher = {};
		this.userid = parseInt(userid);
		for (let a = 0; a < this.teachers.length; a++) {
			const item = this.teachers[a];
			if (item.userid === userid) {
				teacher = item;
				break;
			}
		}
		return teacher;
	}


}
