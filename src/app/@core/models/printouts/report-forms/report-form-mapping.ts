import { ReportForms } from "./report-forms";
import { StudentReport } from "./student-report";
import { SubjectComparison } from "./subject-comparison/subject-comparison";
import { SubjectsReport } from "./subjects/subjects-report";
import { PerformancePerSubject } from "./subjects/performance-per-subject";
import { TimeSeries } from "./time-series/time-series";
import { ExamsCombined } from "./time-series/exams-combined";

export class ReportFormMapping {
	private readonly reportForms: ReportForms;
	constructor(private unformartedReport: any) {
		this.reportForms = new ReportForms();
	}

	public getReportForms() {
		this.reportForms.hasCustomComments = this.unformartedReport.hasCustomComments;
		this.reportForms.totalReports = this.unformartedReport.totalReports;
		this.reportForms.streams = this.unformartedReport.streams;
		this.reportForms.students = this.getStudentReports();
		this.reportForms.gradingSystems = this.unformartedReport.gradingSystem;

		return this.reportForms;
	}

	private getStudentReports(): Array<StudentReport> {
		return this.unformartedReport.list.map(studentReport => ({
			userId: studentReport.userid,
			studentName: studentReport.studentname,
			upi: studentReport.upi,
			profilePicUrl: studentReport.url,
			admNo: studentReport.admno,
			vap: studentReport.vap,
			aggregateStatistics: studentReport.aggregate_stats,
			classTeacher: studentReport.classteacher,
			classTeacherRemarks: studentReport.ct_remarks,
			classTeacherRemarksCustom: studentReport.ct_remarks_custom,
			currentExam: studentReport.current_exam,
			examClassName: studentReport.examclassname,
			examId: studentReport.examid,
			examName: studentReport.examname,
			exams: studentReport.exams,
			examType: studentReport.examtype,
			kcpe: studentReport.kcpe,
			principalRemarks: studentReport.p_remarks,
			seriesid: studentReport.seriesid,
			studentVsClassSubjectComparison: ReportFormMapping.studentVsClassSubjectComparison(studentReport.subject_comparison),
			subjectsReport: ReportFormMapping.subjectsReport(studentReport.subjects),
			timeSeries: ReportFormMapping.timeSeries(studentReport.timeseries),
			majorName: studentReport.majorname,
			majorTextCode: studentReport.majortextcode,
			credentialMessage: studentReport.credentialMessage
		}));
	}

	private static studentVsClassSubjectComparison(subjectComparison): SubjectComparison {
		return {
			studentName: subjectComparison.name_student,
			className: subjectComparison.name_class,
			studentSubjectPerformance: subjectComparison.list_student,
			classSubjectPerformance: subjectComparison.list_class,
			max: subjectComparison.max,
			min: subjectComparison.min,
		};
	}

	private static subjectsReport(subjectsReport): SubjectsReport {
		return {
			showSubjectRank: subjectsReport.show_sbj_rank,
			showTargetGrades: subjectsReport.show_target_grades,
			suffix: subjectsReport.suffix,
			valueType: subjectsReport.value_type,
			subjectsPerformance: ReportFormMapping.subjectsPerformance(subjectsReport.list),
			additionalExams: subjectsReport.additional_exams
		};
	}

	private static subjectsPerformance(performance): Array<PerformancePerSubject> {
		return performance.map(subjectPerformance => ({
			subjectId: subjectPerformance.subjectid,
			subjectName: subjectPerformance.subject,
			change: subjectPerformance.change,
			comment: subjectPerformance.comment,
			customComment: subjectPerformance.comment_custom,
			grade: subjectPerformance.grade,
			subjectRank: subjectPerformance.sbj_rank,
			subjectRankOutOf: subjectPerformance.sbj_rank_outof,
			subjectTeacher: subjectPerformance.st,
			value: subjectPerformance.value,
			additionalResults: subjectPerformance.additional_results,
			mention: subjectPerformance.mention,
			level: subjectPerformance.level,
			gradeAverage: subjectPerformance.grade_average,
			weight: subjectPerformance.weight,
			gpa: subjectPerformance.gpa,
		}));
	}

	private static timeSeries(timeseries): TimeSeries {
		return {
			examsCombined: ReportFormMapping.combinedExams(timeseries.examscombined)
		};
	}

	private static combinedExams(exams): ExamsCombined {
		return {
			max: exams.max,
			min: exams.min,
			combinedExams: exams.list
		};
	}
}
