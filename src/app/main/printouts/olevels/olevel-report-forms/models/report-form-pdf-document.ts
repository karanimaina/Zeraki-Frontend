import {ReportForm} from "../../../../../@core/models/evaluation/report-form";
import {OptionalPdfSections} from "./optional-pdf-sections";
import {Canvas, Cell, Columns, IColumns, IText, Line, Stack, Table, Txt} from "pdfmake-wrapper";
import {TranslateService} from "@ngx-translate/core";
import {StudentReport} from "./student-report";
import {ReportFormPdfBase} from "../../models/report-form-pdf-base";
import {SubjectReport} from "./subject-report";

export class ReportFormPdfDocument extends ReportFormPdfBase {
	private reportForm: ReportForm;
	private _reportFormIdentifiers: any;
	private _openingDate!: string;
	private _closingDate!: string;
	private _feeData: { [key: string]: string } = {};
	private _students: StudentReport[] = [];

	constructor(reportForm: ReportForm, optionalSections: OptionalPdfSections, protected translate: TranslateService) {
		super(optionalSections, translate);
		this.reportForm = reportForm;
		this.pdfDocument.info({
			title: `${this.translate.instant("Olevel Report Form")}`,
		});
	}

	public set reportFormIdentifiers(reportFormIdentifiers: any) {
		this._reportFormIdentifiers = reportFormIdentifiers;
	}

	public set openingDate(openingDate: string) {
		this._openingDate = openingDate;
	}

	public set closingDate(closingDate: string) {
		this._closingDate = closingDate;
	}

	public set feeData(feeData: { [key: string]: string }) {
		this._feeData = feeData;
	}

	public set students(students: any[]) {
		this._students = students;
	}

	getReportFormPdfContent() {
		const reportFormContents: any[] = [];
		const totalStudents = this._students.length;
		let studentIndex = 0;

		const tableHeaders = this.getTableHeaders;

		for (const student of this._students) {
			const reportFormContent: any[] = [];

			/* header */
			const header = this.getHeader(student.studentId);
			const lineSeparator = this.getLineSeparator();
			reportFormContent.push(header, lineSeparator);

			/* student details */
			const studentDetails = this.populateStudentDetails(student);

			reportFormContent.push(studentDetails);

			/* subject results */
			const studentSubjectsHeaders: any[] = this.getStudentSubjectsHeaders();

			const studentSubjects: any[] = [];
			let performancePerCompetency: any[] = [];

			for (const subject of student.subjects) {
				const studentSubject: any[] = [];

				if (this.optionalSections.competencyAreas && subject.topics.length > 0) {
					subject.topics.forEach((topic, topicIndex) => {
						topic.competencyAreas.forEach((competency, cIndex) => {
							// subject name
							let subjectName;
							let descriptor;
							let generalComment;
							let facilitatorComment;
							let teacherName;
							const examData: any[] = [];

							if (topicIndex === 0 && cIndex === 0) {
								const subjectRowSpan = subject.totalCompetencyAreas + (subject.cbcSubjectAverage && subject.totalCompetencyAreas > 1 ? 1 : 0);

								subjectName = new Cell(new Txt(subject.subjectName.toUpperCase()).end).rowSpan(subjectRowSpan).end;
								descriptor = new Cell(new Txt(`${subject.comment ?? ""}`).end).rowSpan(subjectRowSpan).end;
								generalComment = new Cell(new Txt(`${subject.generalComment ?? ""}`).end).rowSpan(subjectRowSpan).end;
								facilitatorComment = new Cell(new Txt(`${subject.subjectComment ?? ""}`).end).rowSpan(subjectRowSpan).end;
								if (this.optionalSections.examSlot) {
									examData.push(new Cell(new Txt(`${subject.exams.score ?? ""}`).end).rowSpan(subjectRowSpan).end);
									examData.push(new Cell(new Txt(`${subject.exams.comment ?? ""}`).end).rowSpan(subjectRowSpan).end);
								}
								teacherName = new Cell(new Txt(`${subject.teacherName ?? ""}`).end).rowSpan(subjectRowSpan).end;
							}


							const rawScores: any[] = [];
							competency.evaluations.forEach((competencyScore, index) => {
								rawScores.push(new Txt(`${competencyScore.rawScore ?? ""}`).end);
								if (index !== competency.evaluations.length - 1) {
									rawScores.push({
										canvas: [
											{
												type: "line",
												x1: -5,
												y1: 0,
												x2: this._orientation == "portrait" ? 32 : 45,
												y2: 0,
												lineWidth: 1
											}
										],
										margin: [0, 4, 0, 4],
									});
								}
							});

							const cbcScores: any[] = [];
							competency.evaluations.forEach((competencyScore, index) => {
								cbcScores.push(new Txt(`${competencyScore.score ?? ""}`).end);
								if (index !== competency.evaluations.length - 1) {
									cbcScores.push({
										canvas: [
											{
												type: "line",
												x1: -5,
												y1: 0,
												x2: this._orientation == "portrait" ? 32 : 45,
												y2: 0,
												lineWidth: 1
											}
										],
										margin: [0, 4, 0, 4],
									});
								}
							});
							// topic name
							const tableColumns: any[] = [];
							if (cIndex === 0) {
								tableColumns.push(new Cell(subjectName? subjectName : new Txt("").end).end);
								tableColumns.push(new Txt(`${topic.name}`).end);
								tableColumns.push(new Txt(`${competency.name}`).end);
								tableColumns.push(cbcScores);
								if (this.optionalSections.rawScore)
									tableColumns.push(rawScores);
								if (this.optionalSections.scoreDescriptor)
									tableColumns.push(descriptor);
								if (this.optionalSections.subjectTeacherComments) {
									tableColumns.push(generalComment);
									tableColumns.push(facilitatorComment);
								}
								if (this.optionalSections.examSlot) {
									tableColumns.push(...examData);
								}
								tableColumns.push(teacherName);

								performancePerCompetency.push(tableColumns);
							}
						});
					});

					performancePerCompetency.forEach((competency, cIndex) => {
						studentSubjects.push(competency);
					});
					performancePerCompetency = [];

					if (subject.cbcSubjectAverage && subject.totalCompetencyAreas > 1) {
						studentSubjects.push(this.getAverageRow(subject));
					}
				} else {
					studentSubject.push(new Txt(subject.subjectName.toUpperCase()).end);

					if (!this.optionalSections.competencyAreas) {
						/*Scores for each of the evaluations*/
						for (const evaluation of subject.evaluations) {
							studentSubject.push(new Txt(`${evaluation.score ?? ""}`).end);
						}
					}else {
						/*Insert default placeholders for chapter and competencies column*/
						studentSubject.push(new Txt("").end);
						studentSubject.push(new Txt("").end);
					}

					studentSubject.push(new Txt(`${subject.cbcSubjectAverage ?? ""}`).end);

					if (this.optionalSections.rawScore)
						studentSubject.push(new Txt(`${subject.rawSubjectAverage ?? ""}`).end);

					if (this.optionalSections.scoreDescriptor)
						studentSubject.push(new Txt(subject.comment).end);

					if (this.optionalSections.subjectTeacherComments) {
						studentSubject.push(new Txt(subject.generalComment).end);
						studentSubject.push(new Txt(subject.subjectComment).end);
					}

					if (this.optionalSections.examSlot) {
						const examScore = subject.exams.score ? subject.exams.score.toString() : "";
						studentSubject.push(new Txt(examScore).end);
						studentSubject.push(new Txt(subject.exams.comment).end);
					}

					studentSubject.push(new Txt(subject.teacherName).end);
					studentSubjects.push(studentSubject);
				}
			}

			const columnWidths = tableHeaders.map((header) => header.width);

			const subjectResults = new Table([
				studentSubjectsHeaders,
				...studentSubjects,
			]).widths(columnWidths).fontSize(8).bold().margin([0, 15]).headerRows(1).end;
			reportFormContent.push(subjectResults);

			/* projects */
			if (this.optionalSections.projects && student.projects.length > 0) {
				const studentProjects = this.getStudentProjects(student);

				const projects = new Stack([
					new Txt(this.translate.instant("printouts.studentReport.projects").toUpperCase())
						.fontSize(10)
						.bold()
						.color("#172b4c").margin([0,0,0,10])
						.end,
					...studentProjects,
				]).end;
				reportFormContent.push(projects);
			}

			/* activities and values */
			if (this.optionalSections.activitiesAndValues && student.studentActivities.length > 0) {
				const studentActivitiesAndValues = this.getStudentActivitiesAndValues(student);

				const activitiesAndValues = new Stack([
					new Txt(this.translate.instant("printouts.studentReport.activitiesAndValues").toUpperCase()).end,
					...studentActivitiesAndValues,
				]).end;
				reportFormContent.push(activitiesAndValues);
			}

			/* class teacher comment and signature */
			const classTeacherCommentAndSignature = this.classTeacherCommentAndSignature(student.classTeacherComment);
			reportFormContent.push(classTeacherCommentAndSignature);

			/* house teacher comment and signature */
			if (this.optionalSections.houseTeacherComments) {
				const houseTeacherCommentAndSignature = this.getHouseTeacherCommentAndSignature(student.houseTeacherComment);
				reportFormContent.push(houseTeacherCommentAndSignature);
			}

			/* head teacher (principle) comment and signature */
			const principalCommentAndSignature = this.getPrincipalCommentAndSignature(student.principalComment);
			reportFormContent.push(principalCommentAndSignature);

			/* fee data */
			if (this._feeData[student.studentAdmNo]) {
				const feeBalance = this.getFeeBalance(student);

				const nextTermFees = this.getNextTermFees(student);

				const totalPayable = this.getTotalPayable(student);

				const feeDetails = this.getFeeDetails(feeBalance, nextTermFees, totalPayable);

				reportFormContent.push(feeDetails);
			}

			/* closing and opening date */
			let schoolClosingDate: IColumns | null = null;
			if (this._closingDate) {
				schoolClosingDate = this.getSchoolClosingDate();
			}

			let schoolOpeningDate: IColumns | null = null;
			if (this._openingDate) {
				schoolOpeningDate = this.getSchoolOpeningDate();
			}

			const dates = this.getOpeningAndClosingDateColumns(schoolClosingDate, schoolOpeningDate);
			reportFormContent.push(dates);

			/* report form identifiers */
			if (this._reportFormIdentifiers) {

				const abbreviations: IText[] = [];
				for (const abbr of this._reportFormIdentifiers.abbreviations) {
					abbreviations.push(new Txt(`${abbr.abbreviation} - ${abbr.meaning}`).margin([5, 0]).end);
				}

				const reportFormIdentifiers = this.getReportFormIdentifiers(abbreviations);
				reportFormContent.push(reportFormIdentifiers);
			}

			/* keywords and descriptions */
			if (this.optionalSections.subjectTeacherComments || this.optionalSections.competencyAreas) {
				const keyWordsHeader = this.sectionHeader(this.translate.instant("printouts.studentReport.keyWords"));

				const keyWordsTable = this.getKeyWordsTable();
				reportFormContent.push(keyWordsHeader, keyWordsTable);
			}

			/* Year summary */
			if (this.optionalSections.yearSummaryReport) {
				reportFormContent.push(this.sectionHeader(this.translate.instant("printouts.studentReport.yearSummary.yearSummaryReport")));
				reportFormContent.push(this.getYearSummaryReportTable(student.yearSummary));
			}

			/* Grade Descriptor */
			if (this.optionalSections.gradeDescriptor) {
				reportFormContent.push(this.sectionHeader(this.translate.instant("printouts.studentReport.yearSummary.gradeDescriptors")));
				reportFormContent.push(this.getGradeDescriptorTable(this.reportForm.grades));
			}


			/* page break */
			if ((studentIndex + 1) !== totalStudents) {
				const pageBreak = new Txt("").pageBreak("before").end;
				reportFormContent.push(pageBreak);
			}

			reportFormContents.push(...reportFormContent);

			studentIndex++;
		}

		return reportFormContents;

	}

	private getAverageRow(subject: SubjectReport) {
		const averageRow: any[] = [];
		averageRow.push(new Cell(new Txt("").end).end);
		averageRow.push(new Cell(new Txt(this.translate.instant("printouts.studentReport.average").toUpperCase()).end).colSpan(2).alignment("center").end);
		averageRow.push(new Cell(new Txt("").end).end);
		averageRow.push(new Cell(new Txt(subject.cbcSubjectAverage.toString()).end).end);
		if (this.optionalSections.rawScore)
			averageRow.push(new Cell(new Txt(subject.rawSubjectAverage?.toString()).end).end);
		if (this.optionalSections.scoreDescriptor)
			averageRow.push(new Cell(new Txt("").end).end);
		if (this.optionalSections.subjectTeacherComments) {
			averageRow.push(new Cell(new Txt("").end).end);
			averageRow.push(new Cell(new Txt("").end).end);
		}
		if (this.optionalSections.examSlot) {
			averageRow.push(new Cell(new Txt("").end).end);
			averageRow.push(new Cell(new Txt("").end).end);
		}
		averageRow.push(new Cell(new Txt("").end).end);
		return averageRow;
	}

	private getKeyWordsTable() {
		return new Table([
			[
				new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.competency")}`).bold().end,
				new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.competencyDesc")}`).end,
			],
			[
				new Txt(`${this.translate.instant("printouts.studentReport.descriptor")}`).bold().end,
				new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.descriptorDesc")}`).end,
			],
			[
				new Txt(`${this.translate.instant("printouts.studentReport.genericSkills")}`).bold().end,
				new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.genericSkillsDesc")}`).end,
			],
			[
				new Txt(`${this.translate.instant("printouts.studentReport.identifier")}`).bold().end,
				new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.identifierDesc")}`).end,
			],
			[
				new Txt(`${this.translate.instant("printouts.studentReport.score")}`).bold().end,
				new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.scoreDesc")}`).end,
			],
		]).widths(["20%", "80%"]).keepWithHeaderRows(5).headerRows(1).fontSize(9).margin([0, 5, 0, 0]).end;
	}

	private getReportFormIdentifiers(abbreviations: IText[]) {
		return new Columns([
			new Txt("").width("*").end,
			new Table([
				[
					new Txt(this.translate.instant("printouts.studentReport.identifier")).end,
					new Txt(this.translate.instant("printouts.studentReport.scoreRange")).end,
					new Txt(this.translate.instant("printouts.studentReport.descriptor")).end,
				],
				[
					new Txt("3").end,
					new Txt("2.5-3.0").end,
					new Txt([
						new Txt(`${this.translate.instant("printouts.studentReport.outstanding")}:`).bold().end,
						new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.score3")}`).end,
					]).end,
				],
				[
					new Txt("2").end,
					new Txt("1.5-2.49").end,
					new Txt([
						new Txt(`${this.translate.instant("printouts.studentReport.moderate")}:`).bold().end,
						new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.score2")}`).end,
					]).end,
				],
				[
					new Txt("1").end,
					new Txt("0.9-1.49").end,
					new Txt([
						new Txt(`${this.translate.instant("printouts.studentReport.basic")}:`).bold().end,
						new Txt(`${this.translate.instant("printouts.studentReport.keyWordsList.score1")}`).end,
					]).end,
				],
				[
					new Cell(
						new Columns([
							new Txt("").width("*").end,
							...abbreviations,
							new Txt("").width("*").end,
						]).end,
					).colSpan(3).end,
					null,
					null,
				],
			]).fontSize(9).bold().keepWithHeaderRows(5).headerRows(1).width("auto").end,
			new Txt("").width("*").end,
		]).margin([0, 15, 0, 0]).end;
	}

	private getOpeningAndClosingDateColumns(schoolClosingDate: null | IColumns, schoolOpeningDate: null | IColumns) {
		const dateColumns: any[] = [];
		if (this._openingDate && this._closingDate) {
			dateColumns.push(schoolClosingDate, new Txt("").width("*").end, schoolOpeningDate);
		}
		if (this._openingDate && !this._closingDate) dateColumns.push(schoolOpeningDate);
		if (!this._openingDate && this._closingDate) dateColumns.push(schoolClosingDate);

		const dates = new Columns(dateColumns).margin([0, 10, 0, 0]).end;
		return dates;
	}

	private getSchoolOpeningDate() {
		return new Columns([
			new Txt(`${this.translate.instant("printouts.studentReport.nextTermBegins")}`).color("#172b4c").end,
			new Stack([
				new Txt(`${this._openingDate}`).end,
				new Canvas([new Line([0, 2], [100, 2]).lineWidth(1.5).dash(2).end]).end,
			]).width("auto").alignment("center").margin([4, 0, 0, 0]).end,
		]).fontSize(9).bold().width("auto").end;
	}

	private getSchoolClosingDate() {
		return new Columns([
			new Txt(`${this.translate.instant("printouts.studentReport.schoolClosedOn")}`).color("#172b4c").end,
			new Stack([
				new Txt(`${this._closingDate}`).end,
				new Canvas([new Line([0, 2], [100, 2]).lineWidth(1.5).dash(2).end]).end,
			]).width("auto").alignment("center").margin([4, 0, 0, 0]).end,
		]).fontSize(9).bold().width("auto").end;
	}

	private getFeeDetails(feeBalance: IColumns, nextTermFees: IColumns, totalPayable: IColumns) {
		return new Columns([
			feeBalance,
			new Txt("").width("*").end,
			nextTermFees,
			new Txt("").width("*").end,
			totalPayable,
		]).margin([0, 10, 0, 0]).end;
	}

	private getTotalPayable(student) {
		return new Columns([
			new Txt(`${this.translate.instant("printouts.studentReport.totalPayable")}`).color("#172b4c").width("auto").end,
			new Stack([
				new Txt(`${this._feeData[student.studentAdmNo] ? this._feeData[student.studentAdmNo]["TERM_BALANCE"] + this._feeData[student.studentAdmNo]["NEXT_TERM_FEES"] + " UGX":""}`).end,
				new Canvas([new Line([0, 2], [100, 2]).lineWidth(1.5).dash(2).end]).end,
			]).width("auto").alignment("center").margin([4, 0, 0, 0]).end,
			new Txt("").width("*").end,
		]).width("auto").fontSize(9).bold().end;
	}

	private getNextTermFees(student) {
		return new Columns([
			new Txt(`${this.translate.instant("printouts.studentReport.nextTermFees")}`).color("#172b4c").width("auto").end,
			new Stack([
				new Txt(`${this._feeData[student.studentAdmNo] ? this._feeData[student.studentAdmNo]["NEXT_TERM_FEES"] + " UGX":""}`).end,
				new Canvas([new Line([0, 2], [100, 2]).lineWidth(1.5).dash(2).end]).end,
			]).width("auto").alignment("center").margin([4, 0, 0, 0]).end,
			new Txt("").width("*").end,
		]).width("auto").fontSize(9).bold().end;
	}

	private getFeeBalance(student) {
		return new Columns([
			new Txt(`${this.translate.instant("printouts.studentReport.feeBalance")}`).color("#172b4c").width("auto").end,
			new Stack([
				new Txt(`${this._feeData[student.studentAdmNo] ? this._feeData[student.studentAdmNo]["TERM_BALANCE"] + " UGX":""}`).end,
				new Canvas([new Line([0, 2], [100, 2]).lineWidth(1.5).dash(2).end]).end,
			]).width("auto").alignment("center").margin([4, 0, 0, 0]).end,
			new Txt("").width("*").end,
		]).width("auto").fontSize(9).bold().end;
	}

	private getStudentActivitiesAndValues(student) {
		const studentActivitiesAndValues: any[] = [];
		for (const studActivity of student.studentActivities) {

			const studActivityData: any[] = [];

			studActivity.activities.forEach((activity, index) => {
				const activityDescriptionRow: any[] = [];

				activityDescriptionRow.push(
					index===0
						?
						new Cell(
							new Txt(`${studActivity.activityName.toUpperCase()}`).alignment("center").end,
						).rowSpan((studActivity.activities.length)).end
						:
						null,
					new Stack([
						new Txt(activity.description).end,
						new Columns([
							new Txt(`${this.translate.instant("common.name")}: ${activity.createdBy.toUpperCase()}`).alignment("left").end,
							new Txt(`${this.translate.instant("common.date")}: ${activity.createdOn}`).alignment("right").end,
						]).margin([0, 5, 0, 0]).end,
					]).end,
				);

				studActivityData.push(activityDescriptionRow);
			});

			const studActivityTable = new Table([
				...studActivityData,
			]).fontSize(9).bold().widths(["20%", "*"]).margin([0, 0, 0, 7.5]).end;

			studentActivitiesAndValues.push(studActivityTable);
		}
		return studentActivitiesAndValues;
	}

	private getStudentProjects(student) {
		const studentProjects: any[] = [];
		for (const project of student.projects) {

			const projectData: any[] = [];

			project.projectResults.forEach((result, index) => {
				const projectTitleRow: any[] = [];
				const projectScoreRow: any[] = [];
				const projectRemarksRow: any[] = [];

				projectTitleRow.push(
					index===0
						?
						new Cell(
							new Txt(`${project.subjectName.toUpperCase()}`).alignment("center").end,
						).rowSpan((project.projectResults.length * 3)).end
						:
						null,
					new Txt(`${this.translate.instant("common.projectTitle").toUpperCase()}`).end,
					new Txt(`${result.projectName}`).end,
				);

				projectScoreRow.push(
					null,
					new Txt(`${this.translate.instant("printouts.studentReport.score")}`).end,
					new Txt(`${result.score ?? ""}`).end,
				);

				projectRemarksRow.push(
					null,
					new Txt(`${this.translate.instant("printouts.studentReport.remarks")}`).end,
					new Txt(`${result.comment ?? ""}`).end,
				);

				projectData.push(projectTitleRow, projectScoreRow, projectRemarksRow);
			});

			const projectTable = new Table([
				...projectData,
			]).fontSize(9).bold().widths(["20%", "15%", "*"]).margin([0, 0, 0, 7.5]).end;

			studentProjects.push(projectTable);
		}
		return studentProjects;
	}

	private getStudentSubjectsHeaders() {
		return this.getTableHeaders.map((header) => (
			new Txt(header.text)
				.fontSize(8).bold()
				.end
		));
	}

	private populateStudentDetails(student) {
		const details = {
			studentName: student.studentName,
			studentAdmNo: student.studentAdmNo,
			streamName: this.reportForm.streamName,
			term: this.reportForm.term.toString(),
			year: this.reportForm.year,
		};

		return this.getStudentDetails(details, student.attendance);
	}


	private get getTableHeaders() {
		const tableHeaders: {text: string, width: string}[] = [];

		tableHeaders.push({
			text: this.translate.instant("printouts.studentReport.subject").toUpperCase(),
			width: this.optionalSections.scoreDescriptor ? "10%" : "*"
		});

		if (this.optionalSections.competencyAreas) {
			tableHeaders.push({
				text: this.translate.instant("printouts.studentReport.chapter").toUpperCase(),
				width: this.optionalSections.subjectTeacherComments ? "10%" : "*"
			});

			tableHeaders.push({
				text: this.translate.instant("printouts.studentReport.competencies").toUpperCase(),
				width: this.optionalSections.subjectTeacherComments ? "14%" : "*"
			});
		}else {
			for (const evalSeries of this.reportForm.evaluationSeries) {
				const text = `${evalSeries.seriesName.split(" ")[0].charAt(0)}${evalSeries.seriesName.split(" ")[1]}`;
				tableHeaders.push({
					text,
					width: this.optionalSections.subjectTeacherComments ? "3%" : "4%"
				});
			}
		}

		tableHeaders.push({
			text: this.translate.instant("printouts.studentReport.cbcScore").toUpperCase(),
			width: "5.5%"
		});

		if (this.optionalSections.rawScore) {
			tableHeaders.push({
				text: this.translate.instant("printouts.studentReport.rawMarks").toUpperCase(),
				width: "5.5%"
			});
		}

		if (this.optionalSections.scoreDescriptor) {
			tableHeaders.push({
				text: this.translate.instant("printouts.studentReport.descriptor").toUpperCase(),
				width:this.optionalSections.subjectTeacherComments ? "10%" : "*"
			});
		}

		if (this.optionalSections.subjectTeacherComments) {
			tableHeaders.push({
				text: this.translate.instant("printouts.studentReport.genericSkills").toUpperCase(),
				width: "*"
			});
			tableHeaders.push({
				text: this.translate.instant("printouts.studentReport.facilitatorRemarks").toUpperCase(),
				width: "*"
			});
		}

		if (this.optionalSections.examSlot) {
			tableHeaders.push({
				text: this.translate.instant("printouts.studentReport.exam").toUpperCase(),
				width: "5%"
			});

			tableHeaders.push({
				text: this.translate.instant("printouts.studentReport.examComment").toUpperCase(),
				width: "9%"
			});
		}

		tableHeaders.push({
			text: this.translate.instant("printouts.studentReport.teacher").toUpperCase(),
			width: "8%"
		});

		return tableHeaders;
	}
}
