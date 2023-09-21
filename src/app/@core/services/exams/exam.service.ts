import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import * as Excel from "exceljs";
import * as fs from "file-saver";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
	providedIn: "root"
})
export class ExamService {

	apiUrl = `${environment.apiurl}`;

	constructor(
		private http: HttpClient,
		private translate: TranslateService
	) { }

	//load init api
	init(): Observable<any> {
		return this.http.get(this.apiUrl + "/users/init");
	}

	//get exams for  manage exams module
	getExamList(ayId?: number): Observable<any> {
		let params = "";
		if (ayId) params += `?ayid=${ayId}`;
		return this.http.get(`${this.apiUrl}/results/school/exams${params}`);
	}

	//get all forms
	getForms(): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/forms");
	}

	releaseExam(typename: string, params: string): Observable<any> {
		return this.http.post(`${this.apiUrl}/results/release${typename}/all/${params}`, null);
	}

	unreleaseExam(typename: string, params: string): Observable<any> {
		return this.http.post(`${this.apiUrl}/results/unrelease${typename}/all/${params}`, null);
	}

	// get current year
	getCurrentYear(): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/year");
	}

	getGraduationYear(intakeid: any): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/year/graduation?intakeid=" + intakeid);
	}

	getAcademicYears(): Observable<any> {
		// return exams.ACADEMIC_YEARS;
		return this.http.get(this.apiUrl + "/groups/academicyears");
	}

	getAllForms(): Observable<any> {
		// return exams.ALLFORMS;
		return this.http.get(this.apiUrl + "/groups/forms/all");
	}

	getSeriesWithoutGroup(term: number, academicYear: number): Observable<any> {
		return this.http.get(this.apiUrl + "/results/series/withoutegroup/" + `${term}/${academicYear}`);
	}

	getStreamIntakes(): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/school/streams?historical=false&last_graduated=true");
	}

	//load form academic years
	getFormAcademicYears(form: number): Observable<any> {
		return this.http.get(this.apiUrl + "/results/year_averages/academicyears?intakeid=" + form);
	}


	getAyExams(params: string): Observable<any> {
		return this.http.get(this.apiUrl + "/results/year_averages/exams" + params);
	}

	getGradeMapping(): Observable<any> {
		//return exams.GRADE_MAPPING;
		return this.http.get(this.apiUrl + "/results/grades");
	}

	getKCSEYear(): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/year");
	}

	checkIntakeHasKsce(params: any): Observable<any> {
		return this.http.get(this.apiUrl + "/analytics/haskcse?intakeid=" + params);
	}
	getIntakeSubjects(params: any): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/subjects?intakeid=" + params);
	}

	getMyClassesExams(): Observable<any> {
		return this.http.get(this.apiUrl + "/results/series/manager");
	}

	getMyClassesData(params: any): Observable<any> {
		return this.http.get(this.apiUrl + "/results/series/manager/data?seriesid=" + params);
	}

	addGradingSystem(body: any, gradingSysName: any): Observable<any> {
		return this.http.post(this.apiUrl + "/results/grades/" + gradingSysName, body);
	}
	deleteGradingSystem(gradingSystemId: number) {
		return this.http.delete(`${this.apiUrl}/results/grades/${gradingSystemId}`);
	}
	getPublishExamList(intakeId: any): Observable<any> {
		return this.http.get(this.apiUrl + "/results/unpublished/dean/-1?intakeid=" + intakeId);
	}
	getEgroupPublishExamList(intakeId: any): Observable<any> {
		return this.http.get(this.apiUrl + "/results/unpublished/dean/examgroup/-1?intakeid=" + intakeId);
	}
	getYearGroupPublishExamList(intakeId: any): Observable<any> {
		return this.http.get(this.apiUrl + "/results/unpublished/dean/annual_examgroup/?intakeid=" + intakeId);
	}
	getPublishExamPreviousExam(intakeId: any): Observable<any> {
		return this.http.get(this.apiUrl + "/results/grades/previousExam?intakeId=" + intakeId + "&isExamSeries=true");
	}
	getEgroupPublishExamPreviousExam(intakeId: any): Observable<any> {
		return this.http.get(this.apiUrl + "/results/grades/previousExam?intakeId=" + intakeId + "&isExamGroup=true");
	}

	getDeletedExams(schoolid: any): Observable<any> {
		return this.http.get(this.apiUrl + "/results/exams/deleted?schoolid=" + schoolid);
	}

	addExamSeries(data: any, params: string): Observable<any> {
		return this.http.post(this.apiUrl + "/results/series/" + params, data);
	}

	addConsolidatedExam(data: any): Observable<any> {
		return this.http.post(this.apiUrl + "/results/examgroup/create", data);
	}

	addYearAverageExam(data: any): Observable<any> {
		return this.http.post(this.apiUrl + "/results/year_averages/generate" + data, null);
	}

	addGuineaYearAverageExam(data: any): Observable<any> {
		return this.http.post(this.apiUrl + "/results/year_averages/guinea/generate", data);
	}

	getIntakeMembers(intakeId: number, isKcse = true): Observable<any> {
		return this.http.get(this.apiUrl + `/groups/class/members/intake?kcse=${isKcse}&intakeid=${intakeId}`);
	}

	// add Guinea term average exam
	addGuineaTermAverage(intakeid: any, ayid: any, term: any): Observable<any> {
		const url = `${this.apiUrl}/results/term_averages/generate/?intakeid=${intakeid}&ayid=${ayid}&term=${term}`;
		return this.http.post(url, null);
	}

	getExamsToUpload_SubjectClass(classid: any, seriesid?: any): Observable<any> {
		let params = "";
		if (seriesid != undefined && seriesid != null && seriesid > 0) {
			params = "?seriesid=" + seriesid;
		}
		return this.http.get(this.apiUrl + "/results/series/subject/noresults/" + classid + params);
	}

	getClass(classid: any): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/class/" + classid);
	}

	getStudentsList_Stream(streamid: any, classid: any): Observable<any> {
		let param = "";
		if (classid != null) {
			param = "&classid=" + classid;
		}
		return this.http.get(this.apiUrl + "/groups/class/members?streamid=" + streamid + param);
	}

	generateKcseExcel(subjects: any[], members: any[]): any {
		// translations
		const fileName = this.translate.instant("exams.createExam.kcseResutsUploadExcelTemplate.fileName");
		const workSheetName = this.translate.instant("exams.createExam.kcseResutsUploadExcelTemplate.workSheetName");

		const indexNumberColName: string = this.translate.instant("exams.createExam.kcseResutsUploadExcelTemplate.workSheetColumnHeaders.indexNumber");
		const nameColName: string = this.translate.instant("exams.createExam.kcseResutsUploadExcelTemplate.workSheetColumnHeaders.name");
		const totalPointsColName: string = this.translate.instant("exams.createExam.kcseResutsUploadExcelTemplate.workSheetColumnHeaders.totalPoints");
		const meanGradeColName: string = this.translate.instant("exams.createExam.kcseResutsUploadExcelTemplate.workSheetColumnHeaders.meanGrade");

		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "indexNumber", width: 12 },
			{ key: "name", width: 2 },
			{ key: "totalPoints", width: totalPointsColName.length + 5 },
			{ key: "meanGrade", width: meanGradeColName.length + 5 },
		];

		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`exams.createExam.kcseResutsUploadExcelTemplate.workSheetColumnHeaders.${item.key}`);

			return (
				{
					header: `${columnHeaderName.toUpperCase()}`,
					key: `${columnHeaderName}`,
					width: item.width
				}
			);
		});

		// create the excel document.
		const workbook = new Excel.Workbook();
		// console.log(workSheetName);
		const sheet = workbook.addWorksheet(workSheetName);

		// create header array
		const header = [...columns];

		// fill in the subject columns
		subjects.forEach((subject) => {
			header.push({
				header: subject.textCode.toString(), key: subject.textCode.toString(), width: 9
			});
		});

		const row: any[] = [];
		let nameWidth = 10;

		//fill in the member data
		members.forEach((member) => {
			if (member.name.toString().length > nameWidth) {
				nameWidth = member.name.toString().length;
			}
			row.push({
				[indexNumberColName]: member.index_number,
				[nameColName]: member.name,
			});

		});

		// update name column width
		header[1].width = nameWidth + 1;

		// set header columns
		sheet.columns = header;

		// formart first row
		sheet.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};

		// add Data
		sheet.addRows(row);

		// save the excel
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, `${fileName}.xlsx`);
		});
	}

	generatePreviousKcseExcel() {
		// translations
		const fileName = this.translate.instant("exams.createExam.kcseResutsUploadPreviousExcelTemplate.fileName");
		const workSheetName = this.translate.instant("exams.createExam.kcseResutsUploadPreviousExcelTemplate.workSheetName");

		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "subject", width: 12 },
			{ key: "year1", width: 9 },
			{ key: "year2", width: 9 },
			{ key: "year3", width: 9 },
		];

		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`exams.createExam.kcseResutsUploadPreviousExcelTemplate.workSheetColumnHeaders.${item.key}`);

			return (
				{
					header: `${columnHeaderName.toUpperCase()}`,
					key: `${columnHeaderName}`,
					width: item.width
				}
			);
		});

		// create the excel document.
		const workbook = new Excel.Workbook();
		// const sheet = workbook.addWorksheet("Upload previous KCSE Subject Me - Template");
		const sheet = workbook.addWorksheet(workSheetName);

		const header = [...columns];

		//create Data Array
		// TODO: this data should come from the backend since it'll be different for each country
		const data: any[] = [];
		data.push(["OVERALL", 7.343, 8.001, 10.532]);
		data.push(["ENG", 9.243, 8.124, 10.132]);
		data.push(["KIS"]);
		data.push(["MAT"]);
		data.push(["BIO"]);
		data.push(["PHY"]);
		data.push(["CHE"]);
		data.push(["HIS"]);
		data.push(["GEO"]);
		data.push(["CRE"]);
		data.push(["IRE"]);
		data.push(["HSC"]);
		data.push(["AD"]);
		data.push(["AGR"]);
		data.push(["WW"]);
		data.push(["MW"]);
		data.push(["BC"]);
		data.push(["PM"]);
		data.push(["ELE"]);
		data.push(["DD"]);
		data.push(["AVT"]);
		data.push(["COM"]);
		data.push(["FRE"]);
		data.push(["GER"]);
		data.push(["MUS"]);
		data.push(["BST"]);
		data.push(["ARA"]);

		//set header columns
		sheet.columns = header;

		//formart first row
		sheet.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};

		//add Data
		sheet.addRows(data);

		//save the excel
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, `${fileName}.xlsx`);
		});
		return header;
	}

	deleteExamPermanently(params: any): Observable<any> {
		return this.http.delete(this.apiUrl + "/results/exam/delete" + params);
	}

	recoverDeletedExam(params: any): Observable<any> {
		return this.http.put(this.apiUrl + "/results/exams/recover" + params, null);
	}

	deleteExam(params: any): Observable<any> {
		return this.http.delete(this.apiUrl + "/results/" + params);
	}

	getExamsforUpload(intakeId: any): Observable<any> {
		return this.http.get(this.apiUrl + "/results/series/form/noresults/-1?intakeid=" + intakeId);
	}

	getSchoolStreams(): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/school/streams?historical=true");
	}

	getBasicDetails(intakeId: any): Observable<any> {
		return this.http.get(this.apiUrl + "/groups/class/basicdetails?intakeid=" + intakeId);
	}

	generateUploadResultsExcel(subjects: any[], members: any[]): any {
		// translations
		const fileName = this.translate.instant("exams.uploadExams.excelTemplateDownload.fileName");
		const workSheetName = this.translate.instant("exams.uploadExams.excelTemplateDownload.workSheetName");

		const admissionNumberColName: string = this.translate.instant("exams.uploadExams.excelTemplateDownload.workSheetColumnHeaders.admissionNumber");
		const nameColName: string = this.translate.instant("exams.uploadExams.excelTemplateDownload.workSheetColumnHeaders.name");
		const streamColName: string = this.translate.instant("exams.uploadExams.excelTemplateDownload.workSheetColumnHeaders.stream");

		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admissionNumber", width: 12 },
			{ key: "name", width: 2 },
			{ key: "stream", width: streamColName.length + 5 },
		];

		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`exams.uploadExams.excelTemplateDownload.workSheetColumnHeaders.${item.key}`);

			return (
				{
					header: `${columnHeaderName.toUpperCase()}`,
					key: `${columnHeaderName}`,
					width: item.width
				}
			);
		});

		// create the excel document.
		const workbook = new Excel.Workbook();
		const sheet = workbook.addWorksheet(workSheetName);

		// create header array
		// const header = [
		// 	{ header: "ADMNO", key: "ADMNO", width: 12 },
		// 	{ header: "NAME", key: "NAME", width: 2 },
		// 	{ header: "STREAM", key: "STREAM", width: "STREAM".length + 5 }
		// ];
		const header = [...columns];

		// fill in the subject columns
		subjects.forEach((subject) => {
			header.push({
				header: subject.textCode.toString(), key: subject.textCode.toString(), width: 9
			});
		});

		const row: any[] = [];
		let nameWidth = 10;

		// fill in the member data
		members.forEach((member) => {
			if (member.name.toString().length > nameWidth) {
				nameWidth = member.name.toString().length;
			}
			row.push({
				// ADMNO: member.admno,
				// NAME: member.name,
				// STREAM: member.stream
				[admissionNumberColName]: member.admno,
				[nameColName]: member.name,
				[streamColName]: member.stream
			});

		});

		// update name column width
		header[1].width = nameWidth + 1;

		// set header columns
		sheet.columns = header;

		// format first row
		sheet.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};

		// add Data
		sheet.addRows(row);

		// save the excel
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, `${fileName}.xlsx`);
		});
	}

	uploadExamResults(params: any, data: any): Observable<any> {
		return this.http.post(this.apiUrl + "/results/upload" + params, data);
	}

	uploadKcseExamResults(params: any, data: any): Observable<any> {
		return this.http.post(this.apiUrl + "/results/kcse" + params, data);
	}

	publishExamsSeries(params: any): Observable<any> {
		return this.http.post(this.apiUrl + "/results/publish/all/" + params, null);
	}

	publishExamsEGroup(params: any): Observable<any> {
		return this.http.post(this.apiUrl + "/results/publish/all/examgroup" + params, null);
	}

	publishGuineaTermAverage(params: any): Observable<any> {
		return this.http.put(`${this.apiUrl}/results/publish/all/term_average${params}`, null);
	}
	publishGuineaYearAverage(params: any): Observable<any> {
		return this.http.put(`${this.apiUrl}/results/publish/all/year_average${params}`, null);
	}

	unpublishExam(params: any, isSeriesOrConsolidated: boolean): Observable<any> {
		if (isSeriesOrConsolidated)
			return this.http.post(this.apiUrl + params, null);
		else
			return this.http.put(this.apiUrl + params, null);

	}

	getSendSmsSeriesInfo(params: any): Observable<any> {
		return this.http.get(this.apiUrl + "/analytics/sms/predetails/" + params);
	}

	sendExamOptions(params: any, body: any): Observable<any> {
		return this.http.post(this.apiUrl + params, body);
	}

	doPostWithParams(url: any, body: any): Observable<any> {
		return this.http.post(this.apiUrl + url, body);
	}

	doPostNoParams(params: any): Observable<any> {
		return this.http.post(this.apiUrl + params, null);
	}

	saveStudentResult(studentData: any, params: string) {
		return this.http.post(`${this.apiUrl}/results/edit/score/${studentData.resultid}/${studentData.raw_temp}/-10${params}`, null);
	}

	doPutNoParams(params: any): Observable<any> {
		return this.http.put(this.apiUrl + params, null);
	}

	doDelete(params: any): Observable<any> {
		return this.http.delete(this.apiUrl + params);
	}
	doGet(params: any): Observable<any> {
		return this.http.get(this.apiUrl + params);
	}

	loadAdminExamsToPublish(classId: number) {
		return this.http.get(`${this.apiUrl}/results/unpublished/subjectteacher/${classId}`);
	}

	getClassDataSeries(intakeId: any, seriesId: any): Observable<any> {
		const url = `/analytics/streamintake?intakeid=${intakeId}&seriesid=${seriesId}&mobile=false`;
		return this.http.get(this.apiUrl + url);
	}

	getClassDataEgroup(intakeId: any, egroupid: any): Observable<any> {
		const url = `/analytics/streamintake?intakeid=${intakeId}&egroupid=${egroupid}&mobile=false`;
		return this.http.get(this.apiUrl + url);
	}

	getClassDataIntake(intakeId: any): Observable<any> {
		const url = `/analytics/streamintake?intakeid=${intakeId}&mobile=false`;
		return this.http.get(this.apiUrl + url);
	}

	getSubjectClassDataSeries(intakeId: any, seriesid: any, subjectid: any): Observable<any> {
		// /analytics/subject?intakeid=19&subjectid=4&seriesid=102
		const url = `/analytics/subject?intakeid=${intakeId}&subjectid=${subjectid}&seriesid=${seriesid}`;
		return this.http.get(this.apiUrl + url);
	}
	getSubjectClassDataEgroup(intakeId: any, egroupid: any, subjectid: any): Observable<any> {
		const url = `/analytics/subject?intakeid=${intakeId}&subjectid=${subjectid}&egroupid=${egroupid}`;
		return this.http.get(this.apiUrl + url);
	}
	// FIXME: delete if it's not used
	exportSubjectMarksToExcel(list: any, name: any) {
		//create the excel document.
		const workbook = new Excel.Workbook();
		const sheet = workbook.addWorksheet(name);
		// sheet.addRow([name]);

		//create header array
		const header = [
			{ header: "ADMNO", key: "ADMNO", width: 12 },
			{ header: "NAME", key: "NAME", width: 2 },
			{ header: "MARKS", key: "MARKS", width: "MARKS".length + 5 },
			{ header: "GRADE", key: "GRADE", width: "GRADE".length + 5 },
			{ header: "STREAM", key: "STREAM", width: "STREAM".length + 5 }
		];
		//fill in the subject columns
		// list.forEach((llist) => {
		//   header.push({
		//     header: subject.textCode.toString(), key: subject.textCode.toString(), width: 9
		//   })
		// });
		const row: any[] = [];
		let nameWidth = 10;

		//fill in the member data
		list.forEach((member: any) => {
			if (member.name.toString().length > nameWidth) {
				nameWidth = member.name.toString().length;
			}
			row.push({
				ADMNO: member.admno,
				NAME: member.name,
				MARKS: member.score,
				GRADE: member.grade,
				STREAM: member.stream
			});
		});

		//update name column width
		header[1].width = nameWidth + 1;
		//set header columns
		sheet.columns = header;

		//formart first row
		sheet.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};

		//add Data
		sheet.addRows(row);

		//save the excel
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, name + ".xlsx");
		});
	}

	exportSubjectMarksToExcel2(list: any, name: any, countryGradeKey: "grade" | "mention" | "achievementLevel") {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "admno" },
			{ key: "name" },
			{ key: "marks" },
			{ key: countryGradeKey },
			{ key: "stream" },
		];


		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(item => {
			const columnHeaderName: string = this.translate.instant(`exams.analysisSubjectMeritList.excelDownload.workSheetColumnHeaders.${item.key}`);
			return columnHeaderName.toUpperCase();
		});

		if (list[0].papers && list[0].papers.length > 0) {
			for (let j = 0; j < list[0].papers.length; j++) {
				columns.splice((2 + j), 0, list[0].papers[j].label);
			}
		}

		const workbook = new Excel.Workbook();
		const sheet = workbook.addWorksheet(name);

		const header: any[] = [...columns];

		const row: any[] = [];
		let nameWidth = 10;

		// fill in the member data
		list.forEach((member: any) => {
			if (member.name.toString().length > nameWidth) {
				nameWidth = member.name.toString().length;
			}

			const memberData: any[] = [];
			memberData.push(
				member.admno,
				member.name,
				member.score,
				(countryGradeKey === "achievementLevel") ? member?.["achievement level"] : member?.[countryGradeKey],
				member.stream
			);

			if (member.papers && member.papers.length > 0) {
				for (let i = 0; i < member.papers.length; i++) {
					memberData.splice((2 + i), 0, member.papers[i].score);
				}
			}
			row.push(memberData);
		});

		sheet.addRow([name]);
		sheet.addRow(header);
		sheet.addRows(row);

		sheet.getColumn("B").width = nameWidth;

		sheet.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};
		sheet.getRow(2).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};
		sheet.mergeCells(`A1:${sheet.lastColumn.letter}1`);
		sheet.getColumn("D").alignment = { horizontal: "right" };

		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
			fs.saveAs(blob, name + ".xlsx");
		});
	}

	getSubjectPublishStatus(seriesId: any, streamId: any): Observable<any> {
		return this.http.get(`${this.apiUrl}/results/unpublished/byexam/${seriesId}/-1?streamid=${streamId}`);
	}

	getSubjectDetailsPublishStatus(streamId: any): Observable<any> {
		return this.http.get(`${this.apiUrl}/groups/class/basicdetails?streamid=${streamId}`);
	}

	generateMarkList(name: string, headerColumns: any[], data: any[], options: any, workSheetName: string): Observable<any> {

		return new Observable((s) => {
			// create the excel document.
			const workbook = new Excel.Workbook();
			const sheet = workbook.addWorksheet(workSheetName);

			// let row: any[] = [];
			// row = data;

			// add Data
			sheet.addRow([name]);
			sheet.addRow(headerColumns);
			sheet.addRows(data);

			// formart first row
			sheet.getRow(1).font = {
				name: "Calibri",
				color: { argb: "000000" },
				bold: true
			};
			sheet.getRow(2).font = {
				name: "Calibri",
				color: { argb: "000000" },
				bold: true
			};

			sheet.mergeCells(`A1:${sheet.lastColumn.letter}1`);
			sheet.getCell("A1").alignment = { horizontal: "center" };
			sheet.getColumn("A").width = options.admNo;
			sheet.getColumn("B").width = options.name;
			sheet.getColumn("C").width = options.stream;

			// save the excel
			workbook.xlsx.writeBuffer().then((data) => {
				const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8" });
				fs.saveAs(blob, name + ".xlsx");
			});
			s.next(`File <b>${name}</b> Downloaded Successfully`);
		});

	}

	getStreamIntakeExamData(params: any, exam_list_only?: any) {
		let url = environment.apiurl + "/analytics/streamintake";
		if (params != undefined && params != null && params.length > 0) {
			url += params;
		}
		if (exam_list_only && exam_list_only != null) {
			let prefix = "?";
			if (params != undefined && params != null && params.length > 0) {
				prefix = "&";
			}
			params = prefix + "exam_list_only=true";
			url += params;
		}
		return this.http.get(url);
	}

	getFile(file_name: any) {
		return this.http.get(`${environment.apiurl}/analytics/examspreadsheet?name=${file_name}`, { responseType: "arraybuffer" });
	}

	getResultstoPublishClassSupervisor(intakeid: number, seriesid?: number) {
		const form = -1;
		let url = `${environment.apiurl}/results/unpublished/classsupervisor/${form}?intakeid=${intakeid}`;
		if (seriesid != null && seriesid > 0) {
			url += "&seriesid=" + seriesid;
		}

		return this.http.get(url);
	}

	createTermAverageExam(termAveragePayload: { intakeId: any; assignmentIds: any[]; academicYearId: any; term: any }) {
		return this.http.post(`${environment.apiurl}/results/term_averages/generate`, termAveragePayload);
	}

	editSeriesExamName(params: URLSearchParams){
		return this.http.post(`${environment.apiurl}/results/series/name?${params}`, null);
	}

	editEgroupExamName(params: URLSearchParams){
		return this.http.put(`${environment.apiurl}/results/egroup/name?${params}`, null);
	}
}
