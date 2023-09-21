import { SchoolInfo } from "../../../school-info";
import { StudentReport } from "../student-report";
import * as Highcharts from "highcharts";
import exporting from "highcharts/modules/exporting";
import { arrowRight, arrowRightDown, arrowRightUp } from "../../../../shared/utilities/report-form-svgs";
import { SchoolTypeData } from "../../../school-type-data";
import { OptionalReportSections } from "../optional-report-sections";
import { TranslateService } from "@ngx-translate/core";
import { formatNumber } from "@angular/common";
import { GradingSystemReport } from "../grading-system-report";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { convert } = require("html-to-text");

export class ReportFormContentImplementation {
	private content: any[];
	private schoolInfo: SchoolInfo;
	private schoolTypeData!: SchoolTypeData;
	private studentReport: StudentReport;
	private readonly isLastStudent: boolean;
	private readonly schoolLogo: any;
	private readonly studentProfileImages: { [key: string]: any } = {};
	private readonly subjectComparisonSvg: string;
	private readonly performanceOverTimeSvg: string;
	private readonly principalSignature: any;
	private readonly translate: TranslateService;
	private readonly gradingDescriptors: GradingSystemReport[];
	private classTeacherSignature: string;
	private optionalReportSections: OptionalReportSections;
	feeData: { [key: string]: string } = {};
	closingDate = "";
	openingDate = "";

	constructor(
		schoolInfo: SchoolInfo,
		studentReport: StudentReport,
		isLastStudent: boolean,
		schoolLogo: any,
		principalSignature: any,
		classTeacherSignature: string,
		studentProfileImages: { [key: string]: any },
		subjectComparisonSvg: string,
		performanceOverTimeSvg: string,
		optionalPdfSections: OptionalReportSections,
		feeData: { [key: string]: string },
		closingDate: string,
		openingDate: string,
		schoolTypeData: SchoolTypeData,
		gradingDescriptors: GradingSystemReport[],
		translate: TranslateService) {

		this.content = [];
		this.schoolInfo = schoolInfo!;
		this.studentReport = studentReport!;
		this.isLastStudent = isLastStudent!;
		this.schoolLogo = schoolLogo;
		this.principalSignature = principalSignature;
		this.studentProfileImages = studentProfileImages!;
		this.subjectComparisonSvg = subjectComparisonSvg!;
		this.performanceOverTimeSvg = performanceOverTimeSvg!;
		this.classTeacherSignature = classTeacherSignature!;
		this.optionalReportSections = optionalPdfSections;
		this.feeData = feeData;
		this.closingDate = closingDate;
		this.openingDate = openingDate;
		this.schoolTypeData = schoolTypeData;
		this.gradingDescriptors = gradingDescriptors;
		this.translate = translate;
		exporting(Highcharts);
	}

	public buildReport() {
		this.addHeader();

		this.addLineSeparator();
		this.addTitle();

		this.addStudentDetails();

		this.addSubjectResults();

		if (this.showGradeDescriptors) {
			this.addGradeDescriptors();
		}

		this.addPerformanceOverTime();

		if (this.studentReport?.classTeacher) {
			this.addClassTeacherRemarks();
		}

		if (this.schoolInfo?.principal) {
			this.addPrincipalRemarks();
		}

		if (this.optionalReportSections.showCredentials) {
			this.addZlCredentials();
		}

		this.addFeesDatesAndParentSignatureContent();

		if (!this.isLastStudent) {
			this.addPageBreak();
		}
	}

	private addHeader() {
		this.content.push(
			{
				columns: [
					this.schoolAddress(),
					this.schoolLogoImg()
				]
			}
		);
	}

	private schoolAddress() {
		return {
			stack: [
				{
					text: this.schoolInfo.name,
					style: "header"
				},
				{
					text: this.schoolInfo.address,
					style: "subheader"
				},
				{
					text: this.schoolInfo.phone,
					style: "subheader"
				},
				{
					text: this.schoolInfo.email,
					style: "subheader"
				}
			],
			width: 400
		};
	}

	private addLineSeparator() {
		this.content.push(
			ReportFormContentImplementation.lineSeparator()
		);
	}

	private static lineSeparator() {
		return {
			canvas: [
				{
					type: "line",
					x1: 0,
					y1: 5,
					x2: 555,
					y2: 5,
					lineWidth: 1.5,
					lineColor: "#43ab49"
				}
			]
		};
	}

	private addTitle() {
		this.content.push(
			{
				text: this.translate.instant("printouts.reportForms.acReportForm") + " - " + this.studentReport.examName,
				style: "reportFormTitle",
				alignment: "center"
			}
		);
	}

	private addStudentDetails() {
		return this.content.push(
			{
				columns: [
					this.profile(),
					this.scoreSummary(),
					[
						{
							text: this.translate.instant("printouts.reportForms.subjectPerfVsClass"),
							style: "studentVsClassLabel"
						},
						this.subjectPerformanceChart()
					]
				]
			}
		);
	}

	private profile() {
		return {
			stack: [
				this.profilePic(),
				this.studentInformation()
			],
			width: "20%"
		};
	}

	private profilePic() {
		return {
			image: this.studentProfileImages[this.studentReport.userId],
			width: 70,
			height: 70,
			alignment: "left",
			margin: [0, 0, 0, 5]
		};
	}

	private studentInformation() {
		const studentInfo: any[] = [];
		if (this.studentReport.admNo) {
			studentInfo.push({
				text: this.translate.instant("printouts.reportForms.admNo") + ": " + this.studentReport.admNo,
				style: "scoreSummaryHeader"
			});
		}
		studentInfo.push({
			text: this.schoolTypeData?.formoryear?.toUpperCase() + ": " + this.studentReport.examClassName,
			style: "scoreSummaryHeader"
		});
		if (this.studentReport.upi) {
			studentInfo.push({
				text: "UPI: " + this.studentReport.upi,
				style: "scoreSummaryHeader"
			});
		}
		if (this.studentReport.kcpe || this.studentReport.vap) {
			studentInfo.push({
				columns: [
					{
						text: this.studentReport.kcpe ? this.translate.instant("printouts.reportForms.kcpe") + ": " + this.studentReport.kcpe : "",
						style: "scoreSummaryHeader"
					},
					{
						text: this.studentReport.vap ? this.translate.instant("printouts.reportForms.vap") + ": " + this.studentReport.vap : "",
						style: "scoreSummaryHeader"
					}
				]
			});
		}

		const showMajorName = this.schoolTypeData?.isGuineaSchool || this.schoolTypeData?.isIvorianSchool;
		if (showMajorName) {
			studentInfo.push({
				text: this.translate.instant("common.major").toUpperCase() + ": " + this.studentReport.majorName,
				style: "scoreSummaryHeader"
			});
		}

		if (this.showGPA) {
			const gpaStats = this.studentReport.aggregateStatistics["seventh"];

			studentInfo.push({
				text: `${gpaStats?.name ?? ""}: ${this.formatStudentGPA(+gpaStats?.value)}`,
				style: "scoreSummaryHeader"
			});
		}

		return [
			{
				text: this.translate.instant("printouts.reportForms.name").toUpperCase() + ": " + this.studentReport.studentName,
				style: "scoreSummaryHeader"
			},
			...studentInfo
		];
	}

	private scoreSummary() {
		return {
			stack: [
				this.totalMarksAndMeanMarks(),
				this.totalPointsAndMeanGrade(),
				this.overallPositionAndStreamPosition()
			],
			width: "25%"
		};
	}

	private totalMarksAndMeanMarks() {
		const totalMarks = this.studentReport.aggregateStatistics["first"];
		const meanMarks = this.studentReport.aggregateStatistics["second"];
		return {
			stack: [
				{
					columns: [
						{
							stack: [
								{
									text: totalMarks.name,
									style: "scoreSummaryHeader",
									alignment: "center"
								},
								{
									text: [
										{
											text: totalMarks.value,
											style: "scoreSummaryValue"
										},
										{
											text: " / " + totalMarks.out_of,
											style: "scoreSummaryValueDark"
										}
									],
									alignment: "center"
								},
								this.deviationChange(totalMarks?.change)
							],
							width: "*"
						},
						{
							stack: [
								{
									text: meanMarks.name,
									style: "scoreSummaryHeader",
									alignment: "center"
								},
								{
									text: meanMarks.value + "" + (meanMarks?.suffix ? meanMarks.suffix : ""),
									style: "scoreSummaryValue",
									alignment: "center"
								},
								this.deviationChange(meanMarks?.change)
							],
							width: "*"
						}
					]
				},
				ReportFormContentImplementation.lineSeparatorGrey()
			]
		};
	}

	private totalPointsAndMeanGrade() {
		const totalPoints = this.studentReport.aggregateStatistics["third"];
		const meanGrade = this.studentReport.aggregateStatistics["fourth"];

		const hidePointsOutOf = this.schoolTypeData?.isSouthAfricaPrimarySchool || this.schoolTypeData?.isSouthAfricaSecondarySchool;

		return {
			stack: [
				{
					columns: [
						{
							stack: [
								{
									text: totalPoints.name,
									style: "scoreSummaryHeader",
									alignment: "center"
								},
								{
									text: [
										{
											text: totalPoints.value,
											style: "scoreSummaryValue"
										},
										{
											text: hidePointsOutOf ? "" : " / " + totalPoints.out_of,
											style: "scoreSummaryValueDark"
										}
									],
									alignment: "center"
								},
								this.deviationChange(totalPoints?.change)
							],
							width: "*"
						},
						{
							stack: [
								{
									text: meanGrade.name || "",
									style: "scoreSummaryHeader",
									alignment: "center"
								},
								{
									text: meanGrade.value || "",
									style: "scoreSummaryValue",
									alignment: "center"
								}
							],
							width: "*"
						}
					]
				},
				ReportFormContentImplementation.lineSeparatorGrey()
			],
		};
	}

	private overallPositionAndStreamPosition() {
		const overallPosition = this.studentReport.aggregateStatistics["fifth"];
		const streamPosition = this.studentReport.aggregateStatistics["sixth"];

		let streamStackData: any = [];
		if (this.optionalReportSections.showStreamStudentRank && streamPosition) {
			streamStackData = [
				{
					stack: [
						{
							text: streamPosition?.name,
							style: ["scoreSummaryHeader", "mt1"],
							alignment: "center"
						},
						{
							text: [
								{
									text: streamPosition?.value,
									style: "scoreSummaryValue"
								},
								{
									text: " / " + streamPosition?.out_of,
									style: "scoreSummaryValueDark"
								}
							],
							alignment: "center"
						},
						this.deviationChange(streamPosition?.change)
					],
					width: "*"
				}
			];
		}

		let overallStackData: any = [];
		if (this.optionalReportSections.showOverallStudentRank && overallPosition) {
			overallStackData = [
				{
					stack: [
						{
							text: overallPosition.name,
							style: "scoreSummaryHeader",
							alignment: "center"
						},
						{
							text: [
								{
									text: overallPosition.value,
									style: "scoreSummaryValue"
								},
								{
									text: overallPosition?.out_of ? " / " + overallPosition.out_of : "",
									style: "scoreSummaryValueDark"
								}
							],
							alignment: "center"
						},
						this.deviationChange(overallPosition?.change)
					],
					width: "*"
				}
			];
		}

		return {
			stack: [
				{
					columns: [
						...overallStackData,
						...streamStackData
					]
				}
			]
		};
	}

	private subjectPerformanceChart() {
		return {
			svg: this.subjectComparisonSvg,
			width: 280
		};
	}

	private deviationChange(change: number | undefined) {
		let deviationChangeSvg = {};
		if (change) {
			deviationChangeSvg = {
				svg: ReportFormContentImplementation.getChangeSVG(change),
				height: 9.5,
				width: 8,
				alignment: "left",
				margin: [1, 3.2, 0, 0]
			};
		}
		return {
			columns: [
				"",
				{
					text: change ? change : "",
					style: "deviation",
					alignment: "right",
					width: "auto"
				},
				deviationChangeSvg,
				""
			]
		};
	}

	private static lineSeparatorGrey(x1?: number, x2?: number) {
		return {
			canvas: [
				{
					type: "line",
					x1: x1 ?? 5,
					y1: 2,
					x2: x2 ?? 160,
					y2: 2,
					lineWidth: 1,
					lineColor: "#e4e5e7"
				}
			]
		};
	}

	private addSubjectResults() {
		const showMentions = this.schoolTypeData?.isIvorianSchool || this.schoolTypeData?.isGuineaSchool;
		const showAchievementLevel = this.schoolTypeData?.isSouthAfricaPrimarySchool || this.schoolTypeData?.isSouthAfricaSecondarySchool;
		const showCoefficients = this.schoolTypeData?.isGuineaSecondarySchool;

		const resultsMap = this.studentReport.subjectsReport.subjectsPerformance.map(result => {
			const additionalResults = this.studentReport.subjectsReport.additionalExams.map(exam => {
				return {
					text: result.additionalResults[exam.seriesid]
						? (result.additionalResults[exam.seriesid] + (exam.percentage == 100 ? "%" : ""))
						: "-",
					style: "tableData"
				};
			});

			const coefficientWeight: any[] = [];
			if (showCoefficients) {
				coefficientWeight.push({
					text: result.weight || "",
					style: "tableData"
				});
			}

			const gpa: any[] = [];
			if (this.showGPA) gpa.push({ text: this.formatStudentGPA(+result.gpa), style: "tableData" });

			const gradeAverage: any[] = [];
			if (this.showGradeAverage) gradeAverage.push({ text: result.gradeAverage.toString(), style: "tableData" });

			return [
				{
					text: result.subjectName,
					style: "tableData"
				},
				...coefficientWeight,
				...additionalResults,
				{
					text: result.value + this.studentReport.subjectsReport.suffix,
					style: "tableData"
				},
				[
					{
						columns: [
							{
								text: result.change > 0 ? "+" + result.change : result.change,
								style: "tableData"
							},
							ReportFormContentImplementation.addArrowIcon(result.change)
						]
					}
				],
				{
					text: (showMentions ? result.mention : (showAchievementLevel ? result.level : result.grade)) || "",
					style: "tableData"
				},
				...gpa,
				...gradeAverage,
				{
					text: result.subjectRank + "/" + result.subjectRankOutOf,
					style: "tableData"
				},
				{
					text: result.comment,
					style: "tableData"
				},
				{
					text: result.subjectTeacher || "",
					style: "tableData"
				}
			];
		});

		let gradeColumnWidth: number | string = 30;
		const additionalExamsWidth: any[] = [];
		const additionalExams = this.studentReport.subjectsReport.additionalExams.map(exam => {
			additionalExamsWidth.push((this.examsLength() <= 2 ? 50 : this.examsLength() == 3 ? 45 : 35));
			return {
				text: exam.name,
				style: "tableHeader",
				rowSpan: this.hasMultipleExams() ? 2 : 1
			};
		});

		const gpaColumnWidth: string[] = [];
		if (this.showGPA) gpaColumnWidth.push("auto");

		const gradeAverageColumnWidth: string[] = [];
		if (this.showGradeAverage) gradeAverageColumnWidth.push("auto");

		const tableHeaders: any[] = [];

		const coefficientHeaderWithRowSpan: any[] = [];
		const coefficientHeaderWithoutRowSpan: any[] = [];
		const coefficientHeaderWidth: number[] = [];

		if (showCoefficients) {
			coefficientHeaderWithRowSpan.push(
				{
					text: this.translate.instant("printouts.reportForms.coefficient").toUpperCase(),
					style: "tableHeader",
					rowSpan: this.hasMultipleExams() ? 2 : 1
				},
			);
			coefficientHeaderWithoutRowSpan.push(
				{
					text: this.translate.instant("printouts.reportForms.coefficient").toUpperCase(),
					style: "tableHeader",
				}
			);

			coefficientHeaderWidth.push(35);
		}

		const gpaTableHeader: any[] = [];
		if (this.showGPA) gpaTableHeader.push({ text: this.translate.instant("common.gpa"), style: "tableHeader" });

		const gradeAverageTableHeader: any[] = [];
		if (this.showGradeAverage) gradeAverageTableHeader.push({ text: this.translate.instant("printouts.reportForms.grAverage"), style: "tableHeader" });

		if (additionalExams.length > 0) {
			gradeColumnWidth = this.showGPA || this.showGradeAverage ? "auto" : 23;
			tableHeaders.push(
				[
					{
						text: this.translate.instant("printouts.reportForms.subject").toUpperCase(),
						style: "tableHeader",
						rowSpan: this.hasMultipleExams() ? 2 : 1
					},
					...coefficientHeaderWithRowSpan,
					...additionalExams,
					{
						text: this.studentReport.currentExam,
						style: "tableHeader",
						alignment: "center",
						colSpan: this.showGPA || this.showGradeAverage ? 4 : 3,
					},
					"",
					"",
					...gpaTableHeader,
					...gradeAverageTableHeader,
					{
						text: this.translate.instant("printouts.reportForms.rank").toUpperCase(),
						style: "tableHeader",
						rowSpan: this.hasMultipleExams() ? 2 : 1
					},
					{
						text: this.translate.instant("printouts.reportForms.comment").toUpperCase(),
						style: "tableHeader",
						rowSpan: this.hasMultipleExams() ? 2 : 1
					},
					{
						text: this.translate.instant("printouts.reportForms.teacher").toUpperCase(),
						style: "tableHeader",
						rowSpan: this.hasMultipleExams() ? 2 : 1
					}
				]
			);
		}
		tableHeaders.push([
			{
				text: additionalExams.length > 0 ? "" : this.translate.instant("common.subjects.title").toUpperCase(),
				style: "tableHeader",
			},
			...coefficientHeaderWithoutRowSpan,
			...additionalExams,
			{
				text: this.translate.instant("common.mks").toUpperCase(),
				style: "tableHeader",
			},
			{
				text: this.translate.instant("printouts.reportForms.dev").toUpperCase(),
				style: "tableHeader"
			},
			{
				text: showMentions
					? this.translate.instant("printouts.reportForms.mention").toUpperCase()
					: (this.hasMultipleExams()
						? showAchievementLevel ? this.translate.instant("printouts.reportForms.lvl").toUpperCase() : this.translate.instant("printouts.reportForms.gr").toUpperCase()
						: showAchievementLevel ? this.translate.instant("printouts.reportForms.level").toUpperCase() : this.translate.instant("printouts.reportForms.grade").toUpperCase()
					),
				style: "tableHeader"
			},
			...gpaTableHeader,
			...gradeAverageTableHeader,
			{
				text: additionalExams.length > 0 ? "" : this.translate.instant("printouts.reportForms.rank").toUpperCase(),
				style: "tableHeader",
			},
			{
				text: additionalExams.length > 0 ? "" : this.translate.instant("printouts.reportForms.comment").toUpperCase(),
				style: "tableHeader",
			},
			{
				text: additionalExams.length > 0 ? "" : this.translate.instant("printouts.reportForms.teacher").toUpperCase(),
				style: "tableHeader",
			}
		]);

		const subjectResultsTable = {
			columns: [
				{
					table: {
						headerRows: this.hasMultipleExams() ? 2 : 1,
						widths: [
							this.examsLength() <= 2 ? 120 : 55,
							...coefficientHeaderWidth,
							...additionalExamsWidth,
							this.examsLength() <= 2 ? 35 : 23,
							23,
							gradeColumnWidth,
							...gpaColumnWidth,
							...gradeAverageColumnWidth,
							26,
							"*",
							"auto",
						],
						body: [
							...tableHeaders,
							...resultsMap,
						],
					},
					margin: [0, 1, 0, 0],
				},
			],
			alignment: "left"
		};

		return this.content.push(subjectResultsTable);
	}

	private addGradeDescriptors() {
		const tableHeaders: Array<{ text: string, style: string }> = [
			{
				text: this.translate.instant("common.grade").toUpperCase(),
				style: "tableHeader",
			},
			{
				text: this.translate.instant("printouts.studentReport.yearSummary.scoreRange").toUpperCase(),
				style: "tableHeader",
			},
			{
				text: this.translate.instant("printouts.studentReport.yearSummary.gradeDescriptor").toUpperCase(),
				style: "tableHeader",
			},
		];

		const tableBodyData = this.gradingDescriptors.map(item => {
			return [
				{
					text: item.grade,
					style: "tableData"
				},
				{
					text: `${item.low} - ${item.high}`,
					style: "tableData"
				},
				{
					text: item.description,
					style: "tableData"
				},
			];
		});

		const gradeDescriptorTable = {
			columns: [
				{
					table: {
						body: [ tableHeaders, ...tableBodyData ],
						widths: ["*", "*", "*" ]
					},
					margin: [0, 1, 0, 0],
				}
			],
		};

		return this.content.push(
			{
				text: this.translate.instant("printouts.studentReport.yearSummary.gradeDescriptor"),
				style: "textBold",
				margin: [0, 3]
			},
			gradeDescriptorTable,
		);
	}

	private formatStudentGPA(gpaScore?: number) {
		let studentGPA = "-";
		if (gpaScore || gpaScore === 0) studentGPA = formatNumber(gpaScore, "en", "1.1-1");
		return studentGPA;
	}

	private get isZimbabweSchool(): boolean {
		return this.schoolTypeData?.isZimbabwePrimarySchool || this.schoolTypeData?.isZimbabweSecondarySchool || this.schoolTypeData?.isZimbabweIgcse;
	}

	private get isZambiaSchool() {
		return this.schoolTypeData?.isZambiaPrimarySchool || this.schoolTypeData?.isZambiaSecondarySchool;
	}

	private get showGPA() {
		return (this.isZimbabweSchool || this.isZambiaSchool) && this.optionalReportSections.showGPA;
	}

	private get showGradeDescriptors() {
		return this.isZambiaSchool && this.optionalReportSections.showGradeDescriptors;
	}

	private get showGradeAverage(): boolean {
		return this.schoolTypeData?.isSouthAfricaPrimarySchool || this.schoolTypeData?.isSouthAfricaSecondarySchool;
	}

	private hasMultipleExams(): boolean {
		return this.studentReport.subjectsReport.additionalExams.length > 0;
	}

	private examsLength(): number {
		return this.studentReport.subjectsReport.additionalExams.length;
	}

	private static addArrowIcon(change) {
		return {
			svg: ReportFormContentImplementation.getChangeSVG(change),
			height: 8,
			width: 7,
			margin: [0, 1, 0, 0],
		};
	}

	private static getChangeSVG(change): string {
		if (change > 0) {
			return arrowRightUp();
		} else if (change < 0) {
			return arrowRightDown();
		} else {
			return arrowRight();
		}
	}

	private addPerformanceOverTime() {
		this.content.push(
			[
				{
					text: this.translate.instant("printouts.reportForms.studPerformance", { studentName: this.studentReport.studentName }),
					style: "textBold",
					margin: [0, 3]
				},
				{
					svg: this.performanceOverTimeSvg,
					height: 150,
					alignment: "center"
				}
			]
		);
	}
	private addClassTeacherRemarks() {
		this.content.push(
			{
				columns: [
					{
						stack: [
							{
								text: this.translate.instant("printouts.reportForms.classTRemarks") + (this.studentReport?.classTeacher?.name ? " - " + this.studentReport.classTeacher.name : ""),
								style: ["textBold", "mt4"],
							},
							{
								text: this.optionalReportSections.showClassTeacherRemarks && this.studentReport?.classTeacherRemarks || "",
								style: "text",
								margin: [0, 3]
							}
						],
						width: "80%",
					},
					{
						stack: [
							{
								text: this.translate.instant("printouts.reportForms.signature"),
								style: ["textBold", "mt4"],
								alignment: "center"
							},
							this.classTeacherSignatureImage(),
						]
					},
				]
			}
		);
	}

	private addPrincipalRemarks() {
		this.content.push(
			{
				columns: [
					{
						stack: [
							{
								text: this.translate.instant("printouts.reportForms.headTRemarks", { principal: this.schoolInfo?.principal?.title }) + " - " + this.schoolInfo?.principal?.name,
								style: ["textBold", "mt4"],
							},
							{
								text: this.optionalReportSections.showPrincipalRemarks && this.studentReport?.principalRemarks || "",
								style: "text",
								margin: [0, 3]
							}
						],
						width: "80%",
					},
					{
						stack: [
							{
								text: this.translate.instant("printouts.reportForms.signature"),
								style: ["textBold", "mt4"],
								alignment: "center"
							},
							this.principalSignatureImg(),
						]
					},
				]
			}
		);
	}


	private classTeacherSignatureImage() {
		if (!this.optionalReportSections.showClassTeacherSignature || !this.studentReport?.classTeacher?.signature)
			return {};

		return {
			image: this.classTeacherSignature,
			width: 70,
			height: 20,
			alignment: "center"
		};
	}

	addZlCredentials() {
		const credentialsText = {
			text: convert(this.studentReport.credentialMessage, {
				wordwrap: 130,
			}),
			style: "textBold",
			margin: [0, 3]
		};
		this.content.push({
			columns: [
				{
					stack: [credentialsText],
					alignment: "center"
				}
			]
		});
	}

	addFeesDatesAndParentSignatureContent() {
		const studentFeeData = {
			termBalance: this.feeData[this.studentReport.admNo] ? this.feeData[this.studentReport.admNo]["TERM_BALANCE"] : null,
			nextTermFees: this.feeData[this.studentReport.admNo] ? this.feeData[this.studentReport.admNo]["NEXT_TERM_FEES"] : null,
		};
		let closingDateText = {};
		let openingDateText = {};
		if (this.closingDate) {
			closingDateText = {
				text: this.translate.instant("printouts.reportForms.schoolClosedOn") + " " + this.closingDate,
				style: "reportExtras",
				margin: [0, 5, 0, 3]
			};
		}
		if (this.openingDate) {
			openingDateText = {
				text: this.translate.instant("printouts.reportForms.nextTermBegins") + " " + this.openingDate,
				style: "reportExtras",
				margin: [0, 3]
			};
		}

		let feesContent: any = [];
		if (studentFeeData.termBalance || studentFeeData.nextTermFees) {
			feesContent = [
				{
					text: this.translate.instant("printouts.reportForms.termBalance") + " " + studentFeeData.termBalance.toLocaleString() ?? 0,
					style: "reportExtras",
					margin: [0, 3]
				},
				{
					text: this.translate.instant("printouts.reportForms.nextTermFees") + " " + studentFeeData.nextTermFees.toLocaleString() ?? 0,
					style: "reportExtras",
					margin: [0, 3]
				},
				ReportFormContentImplementation.lineSeparatorGrey(0, 110),
				{
					text: this.translate.instant("printouts.reportForms.totalPayable") + " " + (studentFeeData.nextTermFees + studentFeeData.termBalance).toLocaleString(),
					style: "reportExtras",
					margin: [0, 3]
				}
			];
		}

		this.content.push({
			columns: [
				{
					stack: feesContent,
					width: "60%"
				},
				{
					stack: [
						closingDateText,
						openingDateText,
						this.parentSignature
					],
					alignment: "right"
				}
			]
		});
	}

	get parentSignature() {
		if (this.optionalReportSections.showParentSignatureSlot) {
			return {
				columns: [
					{
						text: [
							{
								text: this.translate.instant("printouts.reportForms.parentSignature"),
								style: ["textBold"]
							},
							{
								text: " _ _ _ _ _ _ _ _ _ _ _ _ _ _",
								style: "text"
							}
						],
						alignment: "right",
						margin: [0,5,0,0]
					},
				]
			};
		}
		return {};
	}

	principalSignatureImg() {
		if (!this.optionalReportSections.showPrincipalSignature || !this.principalSignature)
			return {};

		return {
			image: this.principalSignature,
			width: 70,
			height: 20,
			alignment: "center"
		};
	}

	private schoolLogoImg() {
		if (this.schoolLogo) {
			return [
				{
					image: this.schoolLogo,
					width: 55,
					height: 55,
					alignment: "right"
				}
			];
		} else {
			return [];
		}
	}

	private addPageBreak() {
		this.content.push({ text: "", pageBreak: "before" });
	}

	public getContents() {
		return this.content;
	}
}
