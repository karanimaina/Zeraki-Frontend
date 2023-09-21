import {Component, ComponentFactoryResolver, ComponentRef, OnInit, ViewChild, ViewContainerRef} from "@angular/core";
import {Location} from "@angular/common";
import {EvaluationService} from "../../../@core/services/exams/evaluations/evaluation.service";
import {ActivatedRoute, Router} from "@angular/router";
import {EvaluationResults, StudentResult} from "../../../@core/models/evaluation/evaluation-results";
import {HotToastService} from "@ngneat/hot-toast";
import { TranslateService } from "@ngx-translate/core";
import {StudentInfo} from "../../../@core/models/student/student-info";
import {NewStudentRowComponent} from "../_components/new-student-row/new-student-row.component";
import { StudentsService } from "src/app/@core/services/student/students.service";

@Component({
	selector: "app-manage-evaluation",
	templateUrl: "./manage-evaluation.component.html",
	styleUrls: ["./manage-evaluation.component.scss"]
})
export class ManageEvaluationComponent implements OnInit {
	editableRows: number[] = [];
	maximumMarks;
	evaluationId!: number;
	classId!: number;
	streamId!: number;
	assessmentResults!: EvaluationResults;
	updatedStudents: number[] = [];
	loading = false;
	results: StudentResult[] = [];
	assessmentType = "";
	isSubjectTeacher!: boolean;
	nonClassMembers: StudentInfo[] = [];
	addingStudentActive = false;

	constructor(private location: Location,
              private evaluationService: EvaluationService,
              private activatedRoute: ActivatedRoute,
              private toastService: HotToastService,
              private translate: TranslateService,
              private router: Router,
              private studentsService: StudentsService,
              private componentFactoryResolver: ComponentFactoryResolver) {
	}

	ngOnInit(): void {
		this.evaluationId = this.activatedRoute.snapshot.params["evaluation"];
		this.classId = this.activatedRoute.snapshot.queryParams["class"];
		this.streamId = this.activatedRoute.snapshot.queryParams["str"];
		this.assessmentType = this.activatedRoute.snapshot.queryParams["type"];
		this.isSubjectTeacher = this.activatedRoute.snapshot.queryParams["iST"] ? this.isTrue(this.activatedRoute.snapshot.queryParams["iST"]) : undefined!;

		if (this.assessmentType == "exam") {
			this.getExamResults();
		}else if(this.assessmentType == "project") {
			this.getProjectResults();
		}else {
			this.getEvaluationResults();
		}

		this.getStudentList();
	}

	get assessmentName() {
		switch (this.assessmentType) {
		case "exam":
			return this.assessmentResults?.examName;
		case "project":
			return this.assessmentResults?.projectName;
		default:
			return this.assessmentResults?.evaluationName;
		}
	}

	editRow(i: number) {
		this.editableRows.push(i);
	}

	saveRowData(i: number, studentId: number, rawMark: number) {
		if (rawMark > this.maximumMarks) {
			return;
		}

		const updatedResults: Array<{studentId: number, rawMark: number, comment: string}> = [];

		this.updatedStudents
			.filter(stud => stud == studentId)
			.map((studentId) => {
				const result = this.results.find(result => result.studentId === studentId);
				if (result) {
					updatedResults.push({
						studentId: result.studentId,
						rawMark: result.rawMark,
						comment: result.comment ? result.comment : " "
					});
				}
			});

		if (this.assessmentType == "exam") {
			this.uploadExamResults(updatedResults, studentId, i);
		}else if(this.assessmentType == "project") {
			this.uploadProjectResults(updatedResults, studentId, i);
		} else {
			this.uploadEvaluationResults(updatedResults, studentId, i);
		}
	}

	navigateBack() {
		if (this.isset(this.isSubjectTeacher)) {
			this.location.back();
		}else {
			this.router.navigate(["/main/evaluation/all"], {queryParams: {class: this.classId}});
		}
	}

	private getStudentList() {
		this.studentsService.getStudentsList_Stream(this.streamId, this.classId).subscribe((res: any) => {
			const classMembers: StudentInfo[] = res.filter(student => student.isClassMember);
			this.nonClassMembers = res.filter(student => !student.isClassMember);

			const classMemberResults: StudentResult[] = classMembers.map(s => {
				return {
					comment: " ",
					factId: null!,
					rawMark: null!,
					score: null!,
					studentAdmNo: s.admno,
					studentId: s.userid,
					studentName: s.name
				};
			});

			const classMembersWithoutResults = this.results.filter(res => !classMemberResults.some(s => s.studentId == res.studentId));

			this.results = [...this.results, ...classMembersWithoutResults];

			if (this.nonClassMembers.length > 0) {
				this.addNewStudentRow();
			}
		});
	}

	private getEvaluationResults() {
		this.evaluationService.getEvaluationResults(this.evaluationId).subscribe((res) => {
			this.assessmentResults = res;
			this.results = res.results;
			this.maximumMarks = res.maxScore;
		});
	}

	private getExamResults() {
		this.evaluationService.getExamResults(this.evaluationId).subscribe((res) => {
			this.assessmentResults = res;
			this.results = res.results;
			this.maximumMarks = res.maxScore;
		});
	}
	private getProjectResults() {
		this.evaluationService.getProjectResults(this.evaluationId).subscribe((res) => {
			this.assessmentResults = res;
			this.results = res.results;
			this.maximumMarks = res.maxScore;
		});
	}
	private uploadEvaluationResults(updatedResults, studentId, index) {
		this.evaluationService.uploadResults(this.evaluationId,this.maximumMarks, updatedResults ).subscribe((res:any) => {

			this.updatedStudents = this.updatedStudents.filter(stud => stud != studentId);
			this.editableRows = this.editableRows.filter(row => row != index);

			const message = this.translate.instant("evaluation.manage.toastMessages.uploadResultsSuccess");
			this.toastService.success(message);

			this.getEvaluationResults();
		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	private uploadProjectResults(updatedResults, studentId, index) {
		this.evaluationService.uploadProjectResults(this.evaluationId,this.maximumMarks, updatedResults ).subscribe((res:any) => {

			this.updatedStudents = this.updatedStudents.filter(stud => stud != studentId);
			this.editableRows = this.editableRows.filter(row => row != index);

			const message = this.translate.instant("evaluation.manage.toastMessages.uploadProjectResultsSuccess");
			this.toastService.success(message);

			this.getProjectResults();

		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	private uploadExamResults(updatedResults: Array<{ studentId: number; rawMark: number }>, studentId: number, index: number) {
		this.evaluationService.uploadExamResults(this.evaluationId,this.maximumMarks, updatedResults ).subscribe((res:any) => {

			this.updatedStudents = this.updatedStudents.filter(stud => stud != studentId);
			this.editableRows = this.editableRows.filter(row => row != index);

			const message = this.translate.instant("evaluation.manage.toastMessages.uploadExamsSuccess");
			this.toastService.success(message);

			this.getExamResults();

		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	addUpdatedStudents(studentId: number) {
		if (!this.updatedStudents.includes(studentId)) {
			this.updatedStudents.push(studentId);
		}
	}

	updateStudentResults() {
		let updatedResults: Array<{studentId: number, rawMark: number, comment: string}> = [];

		this.updatedStudents.map((studentId) => {
			const result = this.results.find(result => result.studentId === studentId);
			if (result) {
				updatedResults.push({
					studentId: result.studentId,
					rawMark: result.rawMark,
					comment: result.comment ? result.comment : " "
				});
			}
		});

		//Add new student results to updated results
		updatedResults = [...updatedResults, ...this.newStudents];

		if (this.assessmentType == "exam") {
			this.uploadAllExamResults(updatedResults);
		}else if(this.assessmentType == "project") {
			this.uploadAllProjectResults(updatedResults);
		}else {
			this.uploadAllEvaluationResults(updatedResults);
		}
	}

	uploadAllEvaluationResults(results: Array<{studentId: number, rawMark: number}>) {
		this.loading = true;
		this.evaluationService.uploadResults(this.evaluationId,this.maximumMarks, results ).subscribe((res) => {
			this.loading = false;
			this.updatedStudents = [];
			this.editableRows = [];

			const message = this.translate.instant("evaluation.manage.toastMessages.uploadResultsSuccess");
			this.toastService.success(message);

			this.getEvaluationResults();
			this.destroyRowComponents();

		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	uploadAllExamResults(results: Array<{studentId: number, rawMark: number}>) {
		this.loading = true;
		this.evaluationService.uploadExamResults(this.evaluationId,this.maximumMarks, results ).subscribe((res) => {
			this.loading = false;
			this.updatedStudents = [];
			this.editableRows = [];
			const message = this.translate.instant("evaluation.manage.toastMessages.uploadResultsSuccess");
			this.toastService.success(message);

			this.getExamResults();
			this.destroyRowComponents();
		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	uploadAllProjectResults(results: Array<{studentId: number, rawMark: number; comment: string}>) {
		this.loading = true;
		this.evaluationService.uploadProjectResults(this.evaluationId,this.maximumMarks, results ).subscribe((res) => {
			this.loading = false;
			this.updatedStudents = [];
			this.editableRows = [];

			const message = this.translate.instant("evaluation.manage.toastMessages.uploadResultsSuccess");
			this.toastService.success(message);

			this.getProjectResults();
			this.destroyRowComponents();

		}, (err) => {
			this.loading = false;
			this.toastService.error(err.error.response.message);
		});
	}

	deleteMarks(index: number, factId: number) {
		if (this.assessmentType == "project") {
			this.evaluationService.deleteProjectMarks(factId).subscribe((res) => {
				this.successMarksDelete(index, factId);
			},err => {
				const message = this.translate.instant("evaluation.manage.toastMessages.deleteMarksError", { reason: err.error?.response.message });
				this.toastService.error(message);
			});
		}
		this.evaluationService.deleteMarks(factId).subscribe({
			next: () => {
				this.successMarksDelete(index, factId);
			},
			error: (err) => {
				const message = this.translate.instant("evaluation.manage.toastMessages.deleteMarksError", { reason: err.error?.response.message });
				this.toastService.error(message);
				// this.toastService.error(`Marks not deleted. <br> Reason: ${err.error?.response.message}`);
			}
		});
	}

	private successMarksDelete(index, factId) {
    this.results.find(result => result.factId === factId)!.rawMark = null!;
    this.results.find(result => result.factId === factId)!.factId = null!;
    this.updatedStudents = this.updatedStudents.filter(studentId => studentId !== factId);
    this.editableRows = this.editableRows.filter(rowIndex => rowIndex !== index);
    const message = this.translate.instant("evaluation.manage.toastMessages.deleteSuccess");
    this.toastService.success(message);
	}


	/* Helper Functions */
	isset(value) {
		return value !== null && value !== undefined;
	}

	isTrue(value) {
		if (typeof(value) === "string") {
			value = value.trim().toLowerCase();
		}
		switch(value) {
		case true:
		case "true":
		case 1:
		case "1":
		case "on":
		case "yes":
			return true;
		default:
			return false;
		}
	}

	@ViewChild("parent", { read: ViewContainerRef}) parent!: ViewContainerRef;
	newStudents: Array<{studentId: number, rawMark: number, comment: string}> = [];
	components: any = [];
	addNewStudentRow() {
		let nonMembers = this.nonClassMembers
			.filter(student => !this.newStudents.some(s => s.studentId == student.userid))
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

				// Hide error message after 2 seconds
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
		newStud.instance.maxMarks = this.maximumMarks;

		//Outputs
		newStud.instance.onAddStudent.subscribe((student) => {

			if (this.assessmentType == "exam") {
				const updatedResults = [
					{
						studentId: student.userid!,
						rawMark: student.marks!,
					}
				];
				this.uploadExamResults(updatedResults, student.userid, null!);
			}else if(this.assessmentType == "project") {
				const updatedResults = [
					{
						studentId: student.userid!,
						rawMark: student.marks!,
						comment: " "
					}
				];
				this.uploadProjectResults(updatedResults, student.userid, null);
			} else {
				const updatedResults = [
					{
						studentId: student.userid!,
						rawMark: student.marks!,
						comment: " "
					}
				];
				this.uploadEvaluationResults(updatedResults, student.userid, null);
			}
		});

		newStud.instance.onStudentChanged.subscribe(({previous, current}) => {
			const previousStudent = this.newStudents.find(st => st.studentId === previous?.userid);
			const newStudent = this.newStudents.find(st => st.studentId === current.userid);
			if (!newStudent) {
				// Remove selected student from list of students in other rows
				this.components.forEach((comp: ComponentRef<NewStudentRowComponent>) => {
					if (comp !== newStud) {
						comp.instance.students = comp.instance._students.filter(st => st.userid !== current.userid);
					}
				});

				// Add student to list of new students in this class
				this.newStudents.push({studentId: current.userid, rawMark: current.marks!, comment: " "});
			}else{
				newStudent.rawMark = current.marks!;
			}
			if (previousStudent) {
				this.newStudents = this.newStudents.filter(st => st.studentId !== previous.userid);
			}
			nonMembers = this.nonClassMembers.filter(student => student.userid !== current.userid);
		});

		newStud.instance.onDestroyRow.subscribe((studentId) => {
			this.newStudents = this.newStudents.filter(st => st.studentId !== studentId);
			this.components = this.components.filter(comp => comp !== newStud);

			this.components.forEach((comp: ComponentRef<NewStudentRowComponent>) => {
				if (comp !== newStud) {
					const stud = this.nonClassMembers.find(st => st.userid === studentId);

					//Add student selected in this row to the list of students
					if (stud && !comp.instance._students.includes(stud)) {
						comp.instance.students = [...comp.instance._students, stud];
					}
				}
			});

			newStud.destroy();
		});
	}

	private destroyRowComponents() {
		this.components.forEach(comp => comp.destroy());
		this.components = [];
		this.addingStudentActive = false;
	}
}
