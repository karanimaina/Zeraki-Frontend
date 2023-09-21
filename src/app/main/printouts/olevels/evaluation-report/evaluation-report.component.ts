import { Component, OnInit } from "@angular/core";
import { AbstractControl, FormControl, FormGroup, Validators } from "@angular/forms";
import { DataService } from "../../../../@core/shared/services/data/data.service";
import { ExamService } from "../../../../@core/services/exams/exam.service";
import { SchoolInfo } from "../../../../@core/models/school-info";
import { ActivatedRoute } from "@angular/router";
import { HotToastService } from "@ngneat/hot-toast";
import { EvaluationService } from "../../../../@core/services/exams/evaluations/evaluation.service";
import { EvaluationReport } from "../../../../@core/models/evaluation/evaluation-report";
import { SchoolTypeData } from "src/app/@core/models/school-type-data";
import { TranslateService } from "@ngx-translate/core";
import { UserService } from "src/app/@core/shared/services/user/user.service";
import { ClassesService } from "src/app/@core/services/classes/classes.service";
import { SchoolService } from "src/app/@core/shared/services/school/school.service";
import { Observable } from "rxjs";
import { Role } from "src/app/@core/models/Role";
import { RolesService } from "src/app/@core/shared/services/role/roles.service";
import { GenericSkillOption } from "../../../../@core/models/evaluation/generic-skill-option";

interface FormList {
	classlevel: number | string;
	intakeid: number,
	streams: Array<{
		streamid: number,
		name: string,
	}>
}
interface StreamList {
	streamid: number,
	name: string,
}
@Component({
	selector: "app-evaluation-report",
	templateUrl: "./evaluation-report.component.html",
	styleUrls: ["./evaluation-report.component.scss"]
})
export class EvaluationReportComponent implements OnInit {
	userRoles$: Observable<Role> = this.rolesService.roleSubject;

	evaluationForm: FormGroup = new FormGroup({
		rform: new FormControl(null, [Validators.required]),
		stream: new FormControl(null, [Validators.required]),
		term: new FormControl(null, [Validators.required]),
		year: new FormControl(null, [Validators.required]),
		classId: new FormControl(null, [Validators.required]),
	});
	schoolTypeData!: SchoolTypeData;
	schoolInfo?: SchoolInfo;
	selected!: { intake: number, stream: number };
	loading = false;
	currentFormList: FormList[] = [];
	streamList: StreamList[] = [];
	validYears: number[] = [];
	academicYears: Array<{ ayid: number, name: string }> = [];
	classes: Array<{ classId: number, subjectName: string }> = [];
	submitted = false;

	//Report Details
	evaluationReport!: EvaluationReport;
	evaluations: Array<{
		evaluationId: number;
		evaluationName: string;
		score: number;
		checked: boolean
	}> = [];
	activeEvaluations: Array<{
		evaluationId: number;
		evaluationName: string;
		score: number;
	}> = [];

	//Default Values from URL
	defaultClass!: number;
	defaultTerm!: number;
	defaultAcadYear!: number;
	addStudentComment!: { studentId: number, studentName: string, genericSkillOption: GenericSkillOption | null, subjectComment: string };
	private userInfo: any;

	constructor(
		private dataService: DataService,
		private examService: ExamService,
		private schoolService: SchoolService,
		private userService: UserService,
		private activatedRoute: ActivatedRoute,
		private classesService: ClassesService,
		private toastService: HotToastService,
		private translate: TranslateService,
		private rolesService: RolesService,
		private evaluationService: EvaluationService) {
		this.activatedRoute.queryParams.subscribe(params => {
			this.defaultClass = params.class;
			this.defaultTerm = params.term;
			this.defaultAcadYear = params.acyr;
		});

		this.dataService.schoolData.subscribe((schoolTypeData) => {
			this.schoolTypeData = schoolTypeData;
			this.currentFormList = schoolTypeData?.current_forms_list;
			schoolTypeData?.graduated_forms_list.forEach((form) => {
				const existingIntakes = this.currentFormList.map((formList) => formList.intakeid);
				if (!existingIntakes.includes(form.intakeid)) {
					this.currentFormList.push({
						classlevel: form.graduationYear,
						intakeid: form.intakeid,
						streams: form.streams
					});
				}
			});
		});
		this.schoolService.schoolInfo.subscribe((schoolInfo) => {
			this.schoolInfo = schoolInfo;
		});

		this.userService.userInfoSubject.subscribe((userInfo) => {
			this.userInfo = userInfo;
		});
	}

	get isEvaluationsEmpty(): boolean {
		return this.evaluations.length === 0;
	}

	ngOnInit(): void {
		this.setDefaultValues();
		this.evaluationForm.controls["rform"].valueChanges.subscribe((value) => {
			this.updateStreams(value);
		});

		this.evaluationForm.controls["stream"].valueChanges.subscribe((value) => {
			if (value) {
				this.getStreamInfo(value.streamid);
			}
		});

		this.examService.getCurrentYear().subscribe((year) => {
			this.evaluationForm.controls["year"].setValue(year);
			this.validYears = [year];
			this.validYears = this.validYears.concat(year - 1, year - 2, year - 3, year - 4);
		});

		this.evaluationService.getAcademicYears().subscribe(({ academicYears }) => {
			this.academicYears = academicYears.map((acyr) => {
				return {
					ayid: acyr.academicYearId,
					name: acyr.beginYear.toString()
				};
			});
		});
	}

	setDefaultValues() {
		if (this.defaultClass && this.defaultTerm && this.defaultAcadYear) {
			this.getEvaluationReport(false);
		}

	}

	get f(): { [key: string]: AbstractControl } {
		return this.evaluationForm.controls;
	}

	updateStreams(intakeId: number) {
		this.streamList = this.currentFormList?.find(i => i.intakeid == intakeId)?.streams!;
		this.evaluationForm.controls["stream"].setValue(null);
	}

	getStreamInfo(streamId: number) {
		this.classes = [];
		this.evaluationForm.controls["classId"].setValue(null);
		this.classesService.getStreamInfo(streamId).subscribe((val: any) => {
			const c = val.stream_info.classes;
			c.forEach((classInfo) => {
				this.classes.push({
					classId: classInfo.subject.classid,
					subjectName: classInfo.subject.name,
				});
			}, (err) => {
				this.toastService.error(err.error.response.message);
			});
		});
	}

	getEvaluationReport(fromForm = false) {
		if (fromForm) {
			this.submitted = true;
			if (this.evaluationForm.invalid) {
				return;
			}
		}

		this.loading = true;

		const evaluationBtn = document.getElementsByClassName("eval-btn") as HTMLCollectionOf<HTMLElement>;
		evaluationBtn[0]?.classList.add("box-btn-slide-close");

		//Get year, term, classId for report query params
		if (fromForm) {
			this.defaultAcadYear = this.evaluationForm.controls["year"].value;
			this.defaultTerm = this.evaluationForm.controls["term"].value;
			this.defaultClass = this.evaluationForm.controls["classId"].value;
		}

		this.evaluationService.getEvaluationReport(this.defaultAcadYear, this.defaultTerm, this.defaultClass).subscribe({
			next: (val) => {
				this.loading = false;
				evaluationBtn[0]?.click();
				this.evaluationReport = val;
				const defaultActiveEvaluations = val.classAverage.evaluations.slice(-4);
				this.evaluations = val.classAverage.evaluations.map(ev => {
					return {
						evaluationId: ev.evaluationId,
						evaluationName: ev.evaluationName,
						score: ev.score,
						checked: defaultActiveEvaluations.includes(ev)
					};
				});
			},
			error: (err) => {
				this.loading = false;
				this.toastService.error(err.error.response.message);
			}
		});
	}

	getStudentMarks(studentAdmNo: string, evaluationId: number) {
		const evaluations = this.evaluationReport?.students.find(stud => stud.studentAdmNo === studentAdmNo)?.evaluations;
		return evaluations?.find((e) => e.evaluationId === evaluationId)?.score;
	}

	updateStudentComment(studentId: number, studentName: string, generalComment: string, subjectComment: string) {
		if (this.addStudentComment) {
			const message = this.translate.instant("printouts.evaluationReport.toastMessages.saveStudentCommentWarning");
			this.toastService.warning(message);
			return;
		}
		const genericSkillOption = this.evaluationReport?.genericSkillsOptions?.find((option) => option?.genericSkill === generalComment) || null;
		this.addStudentComment = {
			studentId,
			studentName,
			genericSkillOption,
			subjectComment
		};
	}

	saveStudentComment(stud: any) {
		const genericSkillId = this.addStudentComment.genericSkillOption?.id || "";
		const subjectComment = this.addStudentComment.subjectComment || " ";

		const data = {
			teacherId: this.userInfo.userid,
			genericSkillId,
			subjectComment,
		};
		if (stud.remarkId) {
			data["remarkId"] = stud.remarkId;
		} else {
			data["term"] = this.defaultTerm;
			data["studentId"] = stud.studentId;
			data["academicYearId"] = this.defaultAcadYear;
			data["classId"] = this.defaultClass;
		}

		this.evaluationService.saveStudentComment(data).subscribe((res: any) => {
			stud.generalComment = this.addStudentComment.genericSkillOption?.genericSkill;
			stud.subjectComment = this.addStudentComment.subjectComment;
			if (res.remarkId) {
				stud.remarkId = res.remarkId;
			}

			this.addStudentComment = null!;

			const message = this.translate.instant("printouts.evaluationReport.toastMessages.saveRemarkSuccess");
			this.toastService.success(message);
		}, (err) => {
			console.log(err.error.response.message);

			const message = this.translate.instant("common.toastMessages.anErrorOccurred");
			this.toastService.error(message);
		});
	}
}
