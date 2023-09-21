import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ClassAttendance } from "../../../../@core/models/classes/class-attendance";
import Swal from "sweetalert2";
import { Location } from "@angular/common";
import { DataService } from "../../../../@core/shared/services/data/data.service";
import { HotToastService } from "@ngneat/hot-toast";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import {Student} from "../../../../@core/models/student/student";
import { ClassesService } from "src/app/@core/services/classes/classes.service";

@Component({
	selector: "app-take-attendance",
	templateUrl: "./take-attendance.component.html",
	styleUrls: ["./take-attendance.component.scss"]
})
export class TakeAttendanceComponent implements OnInit {
	streamId!: number;
	classAttendance!: ClassAttendance;
	selectedStudents: Student[] = [];
	loading = false;
	selectedTerm!: number;
	terms = [
		{label: "Term 1", value: 1},
		{label: "Term 2", value: 2},
		{label: "Term 3", value: 3},
	];
	schoolTypeData!: SchoolTypeData;

	constructor(private activatedRoute: ActivatedRoute,
              private classesService: ClassesService,
              private location: Location,
              private router: Router,
              private dataService: DataService,
              private translate: TranslateService,
              private toastService: HotToastService) {
		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
		});
	}

	ngOnInit(): void {
		this.streamId = this.activatedRoute.snapshot.params.streamId;

		if (this.streamId) {
			this.classesService.getClassList(this.streamId).subscribe((classAttendance: ClassAttendance) => {
				this.classAttendance = classAttendance;
				this.selectedTerm = classAttendance.term;
			});
		}
	}

	toggleAllStudents($event: Event) {
		const checkbox = $event.target as HTMLInputElement;
		if (checkbox.checked) {
			const unselectedStudents = this.classAttendance?.students.filter(student => !this.selectedStudents.includes(student));
			this.selectedStudents.push(...unselectedStudents);
		}else {
			this.selectedStudents = [];
		}
	}

	selectStudent(stud: Student, $event: Event) {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		if ($event.target.checked) {
			if (!this.selectedStudents.includes(stud)) {
				this.selectedStudents.push(stud);
			}
		} else {
			this.selectedStudents = this.selectedStudents.filter(s => s.userid !== stud.userid);
		}
		console.log(this.selectedStudents);
	}

	allStudentsSelected(): boolean {
		return this.classAttendance?.students.length === this.selectedStudents.length;
	}

	confirmSave() {
		Swal.fire({
			title: this.translate.instant("classes.takeAttendance.swal.titleSaveAtendance"),
			text: this.translate.instant("classes.takeAttendance.swal.textSaveAtendance"),
			icon: "info",
			cancelButtonText: this.translate.instant("common.swal.cancelButtonTextNo"),
			showCancelButton: true,
			confirmButtonText: this.translate.instant("common.swal.confirmButtonTextYes"),
			confirmButtonColor: "#43AA49",
			reverseButtons: true
		}).then(result => {
			if(result.isConfirmed) {
				this.saveAttendance();
			}
		});
	}

	saveAttendance() {
		const attendance = this.classAttendance?.students.map(student => {
			return {
				admno: student.admno,
				present: this.selectedStudents.includes(student)
			};
		});

		this.loading = true;

		//Todo Confirm about term parameter
		this.classesService.recordAttendance(this.classAttendance.term, this.streamId, attendance).subscribe((res) => {
			this.loading = false;
			this.router.navigateByUrl("/main/classes/myclass");
			const message = this.translate.instant("classes.takeAttendance.toastMessages.saveSuccess");
			this.toastService.success(message);
		}, (err) => {
			console.log(err);
			this.loading = false;
			if (err.status == 400) {
				this.attendanceError(err.error.response);
			}else{
				this.toastService.error(err.error.response.message);
			}
		});
	}

	navigateBack() {
		this.location.back();
	}

	private attendanceError(res) {
		Swal.fire({
			icon: "error",
			title: res.title,
			text: res.message,
			confirmButtonColor: "#43ab49",
		}).then((res) => {
			this.router.navigateByUrl("/main/classes/myclass");
			// if (res.isConfirmed){
			//   this.router.navigateByUrl(`/main/classes/myclass`);
			// }
		});
	}
}
