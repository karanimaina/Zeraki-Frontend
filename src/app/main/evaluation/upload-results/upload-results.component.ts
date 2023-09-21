import { Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { StudentInfo } from "../../../@core/models/student/student-info";
import { EvaluationService } from "../../../@core/services/exams/evaluations/evaluation.service";
import { HotToastService } from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import { NewStudentRowComponent } from "../_components/new-student-row/new-student-row.component";
import {ExcelTemplateHeader} from "../../../@core/models/excel/excel-template-header";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { StudentsService } from "src/app/@core/services/student/students.service";

@Component({
	selector: "app-upload-results",
	templateUrl: "./upload-results.component.html",
	styleUrls: ["./upload-results.component.scss"]
})
export class UploadResultsComponent implements OnInit {

	classId!: number;
	streamId!: number;
	students: StudentInfo[] = [];
	studentMarks: Array<{ studentId: number, rawMark: number; comment: string }> = [];
	maxScore!: number;
	assessmentId!: number;
	isUploadingResults = false;
	assessmentType = "";
	nonClassMembers: StudentInfo[] = [];
	classMembers: StudentInfo[] = [];
	addingStudentActive = false;

	keyInMarks = true;
	uploadFromExcel = false;

	constructor(
		private classesService: ClassesService,
		private activatedRoute: ActivatedRoute,
		private evaluationService: EvaluationService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private router: Router,
		private studentsService: StudentsService,
		private componentFactoryResolver: ComponentFactoryResolver) {
	}

	ngOnInit(): void {
		this.classId = this.activatedRoute.snapshot.queryParams.class;
		this.assessmentType = this.activatedRoute.snapshot.queryParams.type;
		this.assessmentId = this.activatedRoute.snapshot.params.id;
		this.streamId = this.activatedRoute.snapshot.queryParams.str;

		if (this.assessmentType == "exam") {
			this.maxScore = 80;
		} else if (this.assessmentType == "project") {
			this.maxScore = 10;
		} else {
			this.maxScore = 3;
		}

		this.classesService.getStudentsInClass(this.classId).subscribe((students) => {
			if (students) {
				this.students = students;
			}
		});

		this.getStudentList();
	}

	private getStudentList() {
		this.studentsService.getStudentsList_Stream(this.streamId, this.classId).subscribe((res: any) => {
			this.classMembers = res;
			this.nonClassMembers = res.filter(student => !student.isClassMember);
			if (this.nonClassMembers.length > 0) {
				this.addNewStudentRow();
			}
		});
	}

	navigateBack() {
		this.router.navigate(["/main/evaluation/all"], { queryParams: { class: this.classId } });
	}

	onUploadTypeChange(option: string) {
		switch (option) {
		case "key":
			this.keyInMarks = true;
			this.uploadFromExcel = false;
			break;
		case "upload":
			this.keyInMarks = false;
			this.uploadFromExcel = true;
			break;
		default:
			this.keyInMarks = true;
			this.uploadFromExcel = false;
			break;
		}
	}

	uploadResultsFromExcel(uploadedResults) {
		this.studentMarks = [];
		for (const student of uploadedResults) {
			const studentMark: any = {};
			const existingStudent = this.classMembers.find(member => member.admno == student.admno);
			if (existingStudent) {
				studentMark["studentId"] = existingStudent.userid;
				studentMark["rawMark"] = Number(student.rawMark);
				studentMark["comment"] = student.comment ? student.comment : " ";

				this.studentMarks.push(studentMark);
			}
		}
	}

	uploadResults() {
		this.isUploadingResults = true;

		const isEmptyMarksSubmitted = this.checkEmptyMarksSubmission();
		if (isEmptyMarksSubmitted) {
			this.toastService.warning(this.translate.instant("evaluation.uploadResults.toastMessages.emptyMarksWarning"), { duration: 3000 });
			this.isUploadingResults = false;
			return;
		}

		if (this.assessmentType == "exam") {
			this.uploadExamMarks();
		} else if (this.assessmentType == "project") {
			this.uploadProjectMarks();
		} else {
			this.uploadEvaluationResults();
		}

	}

	private checkEmptyMarksSubmission(): boolean {
		const studentMarksSize = this.studentMarks.length;

		if (studentMarksSize === 0) { // keyed-in marks
			return true;
		} else { // excel marks
			let missingMarksCount = 0;

			for (const studentMark of this.studentMarks) {
				if (typeof studentMark["rawMark"] === "undefined") missingMarksCount += 1;
			}

			if (missingMarksCount === studentMarksSize) return true;
		}

		return false;
	}

	private uploadEvaluationResults() {
		this.evaluationService.uploadResults(this.assessmentId, this.maxScore, this.studentMarks).subscribe((res) => {
			this.isUploadingResults = false;
			this.navigateToManageAssessment();
		}, (err) => {
			this.isUploadingResults = false;
			this.toastService.error(err.error.response.message);
		});
	}

	private uploadExamMarks() {
		this.evaluationService.uploadExamResults(this.assessmentId, this.maxScore, this.studentMarks).subscribe((res) => {
			this.isUploadingResults = false;
			this.navigateToManageAssessment();
		}, (err) => {
			this.isUploadingResults = false;
			this.toastService.error(err.error.response.message);
		});
	}

	private uploadProjectMarks() {
		this.evaluationService.uploadProjectResults(this.assessmentId, this.maxScore, this.studentMarks).subscribe((res) => {
			this.isUploadingResults = false;
			this.navigateToManageAssessment();
		}, (err) => {
			this.isUploadingResults = false;
			this.toastService.error(err.error.response.message);
		});
	}

	private navigateToManageAssessment() {
		const message = this.translate.instant("evaluation.uploadResults.toastMessages.uploadSuccess");
		this.toastService.success(message);
		this.router.navigate(["/main/evaluation/manage/" + this.assessmentId], { queryParams: { class: this.classId, type: this.assessmentType, str: this.streamId } });
	}

	setStudentMarks(userid: number, $event: Event) {
		const marks = ($event.target as HTMLInputElement).value;

		if (marks && Number(marks) < 0) {
			alert("Marks must be a positive number");
		}

		if (this.studentMarks.find((student) => student.studentId === userid)) {
			this.studentMarks.find((student) => student.studentId === userid)!.rawMark = Number(marks);
		} else {
			this.studentMarks.push({ studentId: userid, rawMark: Number(marks), comment: null! });
		}
	}

	getStudentMarks(userid: number) {
		if (this.studentMarks.find((student) => student.studentId === userid)) {
			return this.studentMarks.find((student) => student.studentId === userid)!.rawMark;
		} else {
			return null;
		}
	}

	excessStudentMarks(userid: number) {
		return this.studentMarks.find((student) => student.studentId === userid)?.rawMark! > this.maxScore;
	}


	@ViewChild("parent", { read: ViewContainerRef }) parent!: ViewContainerRef;
	components: any[] = [];
	addNewStudentRow() {
		let nonMembers = this.nonClassMembers
			.filter(student => !this.studentMarks.some(s => s.studentId == student.userid))
			.map(student => {
				student.marks = null!;
				return student;
			});

		if (this.components.length > 0) {
			const lastCreatedComp: ComponentRef<NewStudentRowComponent> = this.components[this.components.length - 1];

			const error = !lastCreatedComp.instance.selectedStudent ||
				!lastCreatedComp.instance.studentMarks ||
				(lastCreatedComp.instance.studentMarks > lastCreatedComp.instance._maxMarks) ||
				(lastCreatedComp.instance.studentMarks < 0);

			if (error) {
				lastCreatedComp.instance.error = true;

				//Hide error message after 2 seconds
				setTimeout(() => {
					lastCreatedComp.instance.error = false;
				}, 2000);

				return;
			}
		}

		const childComponent = this.componentFactoryResolver.resolveComponentFactory(NewStudentRowComponent);
		const newStud = this.parent.createComponent(childComponent);
		this.components.push(newStud);

		//Inputs
		newStud.instance.students = nonMembers;
		newStud.instance.maxMarks = this.maxScore;

		//Outputs
		newStud.instance.onStudentChanged.subscribe(({ previous, current }) => {
			const previousStudent = this.studentMarks.find(s => s.studentId == previous?.userid);
			const newStudent = this.studentMarks.find(s => s.studentId == current.userid);

			if (!newStudent) {
				// Remove selected student from list of students in other rows
				this.components.forEach((comp: ComponentRef<NewStudentRowComponent>) => {
					if (comp !== newStud) {
						comp.instance.students = comp.instance._students.filter(s => s.userid != current.userid);
					}
				});

				// Add student to list of new students in this class
				this.studentMarks.push({ studentId: current.userid, rawMark: current.marks!, comment: " " });
			} else {
				newStudent.rawMark = current.marks!;
			}

			if (previousStudent) {
				this.studentMarks = this.studentMarks.filter(s => s.studentId !== previousStudent.studentId);
			}

			nonMembers = this.nonClassMembers.filter(student => student.userid !== current.userid);
		});

		newStud.instance.onDestroyRow.subscribe((studentId) => {
			this.studentMarks = this.studentMarks.filter(s => s.studentId !== studentId);
			this.components = this.components.filter(comp => comp !== newStud);

			this.components.forEach((comp: ComponentRef<NewStudentRowComponent>) => {
				if (comp !== newStud) {
					const stud = this.nonClassMembers.find(st => st.userid == studentId);

					//Add student selected in this row to the list of students
					if (stud && !comp.instance._students.includes(stud)) {
						comp.instance.students = [...comp.instance._students, stud];
					}
				}
			});

			newStud.destroy();
		});
	}

	get excelTemplateHeaders(): Array<ExcelTemplateHeader> {
		const headers:ExcelTemplateHeader[] = [
			{
				key: "admno",
				value: "admno",
				translate: true
			},
			{
				key: "name",
				value: "name",
				width: 15,
				translate: true
			},
			{
				key: "marks",
				value: "rawMark",
				type: "marks",
				translate: true
			}
		];

		if (this.assessmentType == "project") {
			headers.push({
				key: "comment",
				value: "comment",
				width: 20,
				translate: true
			});
		}

		return headers;
	}

	get excelStudentEntries() {
		return this.classMembers.map(student => ({admNo: student.admno, name: student.name}));
	}
}
