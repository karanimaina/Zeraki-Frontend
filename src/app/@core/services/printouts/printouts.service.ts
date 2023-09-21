import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import * as Highcharts from "highcharts";
import {
	Canvas,
	Columns,
	Img,
	Line,
	PdfMakeWrapper,
	Table,
	Txt
} from "pdfmake-wrapper";
import * as pdfFonts from "pdfmake/build/vfs_fonts"; // fonts provided for pdfmake
import { environment } from "src/environments/environment";
import { jsPDF } from "jspdf";
import { Canvg } from "canvg";
import Exporting from "highcharts/modules/exporting";
import * as saveAs from "file-saver";
import { Observable } from "rxjs";

@Injectable({
	providedIn: "root"
})
export class PrintoutsService {
	Highcharts: typeof Highcharts = Highcharts;

	constructor(private http: HttpClient) {
		Exporting(Highcharts);
	}

	getExamStudentsAndStreams(params: any) {
		return this.http.get(
			`${environment.apiurl}/analytics/sms/predetails/${params}`
		);
	}

	getStudentsList_SubjectClass(
		classid: any,
		intakeid: any = null,
		streamid: any = null,
		subjectid: any = null
	) {
		let params = "";
		if (
			subjectid != null &&
			subjectid > 0 &&
			((streamid != null && streamid > 0) || (intakeid != null && intakeid > 0))
		) {
			params = "?subjectid=" + subjectid;

			if (streamid != null && streamid > 0) {
				params += "&streamid=" + streamid;
			} else if (intakeid != null && intakeid > 0) {
				params += "&intakeid=" + intakeid;
			}
		}
		return this.http.get(
			`${environment.apiurl}/groups/class/subject/members/${classid}${params}`
		);
	}

	getSubject(subjectid: any) {
		return this.http.get(`${environment.apiurl}/groups/subject/${subjectid}`);
	}

	getTranscript(userid: any, params: string) {
		if (!userid) {
			return this.http.get(
				`${environment.apiurl}/analytics/transcript/${params}`
			);
		}
		return this.http.get(
			`${environment.apiurl}/analytics/transcript/${userid}${params}`
		);
	}

	getGraduatedStudentList(stream: any) {
		return this.http.get(
			`${environment.apiurl}/groups/class/members?streamid=${stream}`
		);
	}

	getGraduatedStudentInformation(studentid: number) {
		return this.http.get(
			`${environment.apiurl}/users/student/leavingCertificate?studentId=${studentid}`
		);
	}

	getCustomClassList(url: string) {
		return this.http.get(`${environment.apiurl}/${url}`, {
			responseType: "arraybuffer"
		});
	}

	custom_saver(blob: any, file_name: any) {
		saveAs(blob, file_name);

		//Android Download
		// var reader = new FileReader;
		// reader.onload = function () {
		// var base64data = reader.result;
		// Android.downloadFile(base64data, fileName);
		// };
		// reader.readAsDataURL(blob);
	}

	getExcelMeritList(params: string) {
		const url = `analytics/streamintake/meritlist${params}`;
		return this.http.get(`${environment.apiurl}/${url}`, {
			responseType: "arraybuffer"
		});
	}

	getExcel_A_reports(url: string) {
		return this.http.get(`${environment.apiurl}/${url}`, {
			responseType: "arraybuffer"
		});
	}

	async generatePdfReport(
		school: any,
		logo: any,
		title: string,
		table: any[],
		tableWidths: any[],
		pageSize = "A4",
		titleRows: number
	) {
		PdfMakeWrapper.setFonts(pdfFonts);
		const pdf = new PdfMakeWrapper();
		pdf.pageOrientation("portrait");
		pdf.defaultStyle({
			fontSize: 7
		});
		pdf.pageSize(pageSize);

		// console.warn(school.name, title);
		const schoolNameNode = new Txt(school.name)
			.fontSize(16)
			.bold()
			.alignment("center").end;
		const titleNode = new Txt(title)
			.fontSize(20)
			.color("#673ab7")
			.alignment("center").end;
		const schoolAddress = new Txt(school.address || "").alignment("right").end;
		const schoolPhone = new Txt(school.phone || "").alignment("right").end;
		const schoolEmail = new Txt(school.email || "").alignment("right").end;

		let logoNode: any;
		try {
			logoNode = await new Img(`${logo}?cacheblock=true`)
				.fit([60, 60])
				.alignment("left")
				.build();
		} catch (error) {
			logoNode = await new Img("../../../../assets/img/sig_default.jpg")
				.fit([60, 60])
				.alignment("left")
				.build();
		}

		// let logoNode = await new Img(logo).fit([60, 60]).alignment("left").build();
		// let logoNode = await new Img("../../../../assets/img/default-logo.png").fit([60, 60]).alignment("left").build();

		pdf.add(
			new Columns([
				[logoNode],
				[schoolNameNode, titleNode],
				[schoolAddress, schoolPhone, schoolEmail]
			]).columnGap(5).end
		);

		pdf.add(new Table([[], [], [], []]).end);

		pdf.add(
			new Table(table)
				.headerRows(titleRows || 2)
				.widths(tableWidths)
				.layout({
					fillColor: function (i) {
						if (i === 0 || (i && i < titleRows)) {
							return "#eeeeff";
						}
						return "#fff";
					},
					hLineWidth: (i) => {
						// if (i === 0 || i === 1) {
						// 	return 0;
						// }
						return 1;
					},
					vLineWidth: function () {
						return 1;
					},
					hLineColor: function () {
						return "#000000";
					},
					vLineColor: function () {
						return "#000000";
					},
					paddingTop: function () {
						return 4;
					},
					paddingBottom: () => {
						return 4;
					}
				}).end
		);

		return pdf.create();
	}

	async generateLeavingCert(
		schoolCert: any,
		coa: string,
		schoolTitle: string,
		intakeLabel: string,
		schoolLogo: string,
		pageSize = "A4"
	) {
		// console.warn("schoolLogo", schoolLogo);
		PdfMakeWrapper.setFonts(pdfFonts);
		const pdf = new PdfMakeWrapper();
		pdf.pageOrientation("portrait");
		pdf.defaultStyle({
			fontSize: 10
		});
		pdf.pageSize(pageSize);

		if (!schoolCert.student.upiNumber || schoolCert.student.upiNumber == null) {
			schoolCert.student.upiNumber = "N/A";
		}

		const ktext = new Txt("REPUBLIC OF KENYA").alignment("left").end;
		const mText = new Txt("MINISTRY OF EDUCATION").alignment("left").end;
		const schoolNameNode = new Txt(
			schoolCert.school.name.toString().toUpperCase()
		).alignment("right").end;
		const schoolAddress = new Txt(
			schoolCert.school.address.toString().toUpperCase()
		).alignment("right").end;
		const titleNode = new Txt(
			`${schoolTitle.toUpperCase()} SCHOOL LEAVING CERTIFICATE`
		)
			.fontSize(16)
			.decoration("underline")
			.bold()
			.alignment("center").end;
		const admNode = new Txt(
			`Admission/Serial No. ${schoolCert.student.admissionNumber}`
		)
			.bold()
			.alignment("left").end;
		const upiNode = new Txt(
			`UPI No.  ${schoolCert.student.upiNumber.toString().toUpperCase()}`
		)
			.bold()
			.alignment("right").end;
		const studNameNode = new Txt(
			`${schoolCert.student.name.toString().toUpperCase()}`
		)
			.bold()
			.alignment("right").end;

		// let logoNode = await new Img(logo).fit([60, 60]).alignment("left").build();
		const logoNode = await new Img(`${schoolLogo}?cacheblock=true`)
			.fit([65, 65])
			.alignment("right")
			.build();
		const keNode = await new Img(coa).fit([65, 65]).alignment("left").build();

		pdf.add(
			new Columns([
				[keNode, pdf.ln(0.5), ktext, pdf.ln(0.1), mText],
				[logoNode, pdf.ln(0.5), schoolNameNode, pdf.ln(0.1), schoolAddress]
			]).columnGap(5).end
		);

		pdf.add(new Table([[], [], [], [], []]).end);

		pdf.add(titleNode);

		pdf.add(new Table([[], [], [], [], []]).end);

		pdf.add(new Columns([[admNode], [upiNode]]).columnGap(5).end);

		pdf.add(new Canvas([new Line([90, 1], [150, 1]).dash(1).end]).end);

		pdf.add(new Table([[], [], [], []]).end);

		pdf.add(
			new Columns([
				[new Txt("This is to certify that").alignment("left").end],
				[
					new Txt(`${schoolCert.student.name.toString().toUpperCase()}`)
						.bold()
						.alignment("left").end
				],
				[],
				[]
			]).columnGap(0).end
		);

		pdf.add(new Canvas([new Line([95, 1], [470, 1]).dash(1).end]).end);

		pdf.add(new Table([[], [], []]).end);

		pdf.add(
			new Table([
				[
					new Txt("Entered this school on ").fontSize(11).alignment("left").end,
					new Txt("").end,
					new Txt(`${schoolCert.student.admissionDate}`)
						.fontSize(11)
						.bold()
						.alignment("left").end,
					new Txt("").end,
					new Txt(`and was enrolled in ${intakeLabel.toLowerCase()}`)
						.fontSize(11)
						.alignment("left").end,
					new Txt("").end,
					new Txt(
						`${schoolCert.student.enrollmentForm.toString().toUpperCase()}`
					)
						.bold()
						.fontSize(11)
						.alignment("center").end,
					new Txt("").end,
					new Txt("and left in").fontSize(10).alignment("left").end,
					new Txt(
						`${schoolCert.student.graduationDate.toString().toUpperCase()}`
					)
						.fontSize(11)
						.bold()
						.alignment("left").end
				]
			]).layout("noBorders").end
		);

		pdf.add(new Canvas([new Line([110, 1], [200, 1]).dash(1).end]).end);

		pdf.add(new Canvas([new Line([320, 1], [360, 1]).dash(1).end]).end);

		pdf.add(new Canvas([new Line([410, 1], [510, 1]).dash(1).end]).end);

		pdf.add(new Table([[], [], []]).end);

		pdf.add(
			new Table([
				[
					new Txt(`from ${intakeLabel.toLowerCase()}`)
						.fontSize(11)
						.alignment("left").end,
					new Txt("").end,
					new Txt(
						`${schoolCert.student.graduationForm.toString().toUpperCase()}`
					)
						.bold()
						.fontSize(11)
						.alignment("center").end,
					new Txt("").end,
					new Txt(
						`having satisfactory completed the approved course for ${intakeLabel.toLowerCase()}`
					)
						.fontSize(11)
						.alignment("left").end,
					new Txt("").end,
					new Txt(
						`${schoolCert.student.graduationForm.toString().toUpperCase()}`
					)
						.bold()
						.fontSize(11)
						.alignment("center").end
				]
			]).layout("noBorders").end
		);

		pdf.add(new Canvas([new Line([55, 1], [88, 1]).dash(1).end]).end);

		pdf.add(new Canvas([new Line([390, 1], [470, 1]).dash(1).end]).end);

		pdf.add(new Table([[], [], [], [], [], []]).end);

		pdf.add(
			new Table([
				[
					new Txt("Date Of Birth").fontSize(11).alignment("left").end,
					new Txt("(In Admission Register)")
						.fontSize(11)
						.italics()
						.alignment("left").end,
					new Txt("").end,
					new Txt("").end,
					new Txt(`${schoolCert.student.dateOfBirth.toString().toUpperCase()}`)
						.bold()
						.fontSize(11)
						.alignment("center").end,
					new Txt("").end,
					new Txt("").end
				]
			]).layout("noBorders").end
		);

		pdf.add(new Canvas([new Line([192, 1], [300, 1]).dash(1).end]).end);

		pdf.add(new Table([[], [], []]).end);

		pdf.add(
			new Table([
				[
					new Txt(
						`${schoolCert.school.principalTitle}’s report on the pupil’s ability, industry and conduct`
					)
						.fontSize(11)
						.alignment("left").end
				]
			]).layout("noBorders").end
		);

		pdf.add(new Table([[], []]).end);

		const description_array = schoolCert.parts;

		description_array.forEach((desc: any) => {
			pdf.add(
				new Table([
					[new Txt(`${desc}`).fontSize(11).bold().alignment("left").end]
				]).layout("noBorders").end
			);

			pdf.add(new Canvas([new Line([0, 1], [500, 1]).dash(1).end]).end);

			pdf.add(new Table([[], [], []]).end);
		});

		pdf.add(new Table([[], [], [], [], []]).end);

		pdf.add(
			new Table([
				[
					new Txt("Student Signature:").fontSize(11).alignment("left").end,
					new Txt("").end,
					new Txt("").end,
					new Txt("Date Of Issue:").fontSize(11).alignment("right").end
				]
			]).layout({
				hLineWidth: (i) => {
					return 0;
				},
				vLineWidth: function () {
					return 0;
				},
				paddingLeft: function () {
					return 30;
				},
				paddingRight: function () {
					return 40;
				}
			}).end
		);

		pdf.add(new Canvas([new Line([120, 1], [210, 1]).dash(1).end]).end);

		pdf.add(new Canvas([new Line([400, 1], [480, 1]).dash(1).end]).end);

		pdf.add(new Table([[], [], [], [], [], [], [], []]).end);

		pdf.add(
			new Columns([
				[
					new Txt("Signature: ..................................")
						.fontSize(11)
						.alignment("center").end
				]
			]).end
		);

		pdf.add(new Table([[], []]).end);

		pdf.add(
			new Columns([
				[
					new Txt(schoolCert.school.principal.name.toString().toUpperCase())
						.bold()
						.fontSize(11)
						.alignment("center").end
				]
			]).end
		);

		pdf.add(new Table([[]]).end);

		pdf.add(
			new Columns([
				[
					new Txt(schoolCert.school.principalTitle.toString().toUpperCase())
						.bold()
						.fontSize(11)
						.alignment("center").end
				]
			]).end
		);

		if (schoolCert.parts.length > 1) {
			pdf.add(new Table([[], [], [], [], [], [], [], []]).end);
		} else {
			pdf.add(
				new Table([[], [], [], [], [], [], [], [], [], [], [], [], [], [], []])
					.end
			);
		}

		pdf.add(
			new Columns([
				[
					new Txt(
						"This certificate was issued without any erasure or alteration whatsoever"
					)
						.fontSize(12)
						.bold()
						.alignment("center").end
				]
			]).end
		);

		return pdf.create();
	}

	async generateStudentReportForm(content: any, options: any): Promise<any> {
		let vl: any = null;
		const vb: any = null;

		//how to get the graph onto the pdf
		//1. use library chartJs
		//2. use the library as you would normaly do on anormal js environment
		//3. create a canvas element
		//4. setup the canvas element with the chart
		//5. convert it into an image
		//6. Add the newly created image to our html component
		//
		const d: any = new jsPDF("p", "mm", "a4", true);
		// d.setFontSize('helvetica');
		// d.setFontType("bold");

		const textWidth = function (text, font_size) {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d")!;
			ctx.font = font_size + " helvetica"; // This can be set programmaticly from the element's font-style if desired
			const textWidth = ctx.measureText(text).width;
			return textWidth / 3.7795275591;
		};

		const pxToMm = function (px) {
			return px / 3.7795275591;
		};

		//declare all the images for deviation here
		/* //----------------------------------/*
	  let c = document.getElementById("myCanvas");
	  let ctx = c.getContext("2d");
	  let img = document.getElementById("scream");
	  ctx.drawImage(img, 10, 10);
	  //----------------------------------*/
		const score_deviation_plain = new Image();
		const score_deviation_plus = new Image();
		const score_deviation_minus = new Image();
		let school_logo_image = new Image();
		const student_logo = new Image();
		const graph_title_image = new Image();
		const graph_subject_performance_img = new Image();
		const graph_student_performance_img = new Image();
		//add images for parent and principal signatures!

		//score_deviation_plus.src = "./assets_new/images/deviation-plus.png";

		//convert all the logos required via canvas to prevent re-loading of sorts
		//deviation plain image
		const canvas_score_deviation_plain = document.createElement("canvas");
		canvas_score_deviation_plain.setAttribute("width", "34.85");
		canvas_score_deviation_plain.setAttribute("height", "34.85");
		document
			.getElementById("canvas_for_icon_widgets")
			?.appendChild(score_deviation_plain);
		const csdp_ctx1 = canvas_score_deviation_plain.getContext("2d");
		const dev_plain: any = document.getElementById("dev_plain")!;
		csdp_ctx1?.drawImage(dev_plain, 0, 0, 34.85, 34.85);
		score_deviation_plain.src = canvas_score_deviation_plain.toDataURL(
			"image/png",
			0.39
		);

		//deviation plus image
		const canvas_score_deviation_plus = document.createElement("canvas");
		canvas_score_deviation_plus.setAttribute("width", "34.85");
		canvas_score_deviation_plus.setAttribute("height", "34.85");
		document
			.getElementById("canvas_for_icon_widgets")
			?.appendChild(score_deviation_plus);
		const csdp_ctx2 = canvas_score_deviation_plus.getContext("2d");
		csdp_ctx2?.drawImage(
			document.getElementById("dev_plus")! as any,
			0,
			0,
			34.85,
			34.85
		);
		score_deviation_plus.src = canvas_score_deviation_plus.toDataURL(
			"image/png",
			0.39
		);

		//--------------
		//--------------

		//deviation minus image
		const canvas_score_deviation_minus = document.createElement("canvas");
		canvas_score_deviation_minus.setAttribute("width", "34.85");
		canvas_score_deviation_minus.setAttribute("height", "34.85");
		document
			.getElementById("canvas_for_icon_widgets")
			?.appendChild(score_deviation_minus);
		const csdp_ctx3 = canvas_score_deviation_minus.getContext("2d");
		csdp_ctx3?.drawImage(
			document.getElementById("dev_minus")! as any,
			0,
			0,
			34.85,
			34.85
		);
		score_deviation_minus.src = canvas_score_deviation_minus.toDataURL(
			"image/png",
			0.39
		);

		//school logo image
		if (options.school.hasLogo) {
			const canvas_school_logo = document.createElement("canvas");
			canvas_school_logo.setAttribute("width", "111.2995");
			canvas_school_logo.setAttribute("height", "99.960");
			document
				.getElementById("canvas_for_icon_widgets")
				?.appendChild(score_deviation_plus);
			const csdp_ctx4 = canvas_school_logo.getContext("2d");
			// csdp_ctx4?.drawImage(document.getElementById('sch_logo')! as any, 0, 0, 111.2995, 99.960);
			// school_logo_image.src = canvas_school_logo.toDataURL("image/png", 0.39);
			// school_logo_image.crossOrigin="anonymus"
			school_logo_image.src = options.school.logo;
			// school_logo_image.src = 'https://zeraki-analytics.s3.eu-central-1.amazonaws.com/profile-pic/344ddcacf1844d429d33d56e06b5205b_162927.jpg';
			// school_logo_image.src = 'https://picsum.photos/200';
			school_logo_image.onload = () => {
				csdp_ctx4?.drawImage(school_logo_image, 0, 0, 111.2995, 99.96);
			};
			school_logo_image.onerror = () => {
				school_logo_image = new Image();
			};
			//options.school.logo
		}
		//student logo
		const canvas_student_logo = document.createElement("canvas");
		canvas_student_logo.setAttribute("width", "152.001");
		canvas_student_logo.setAttribute("height", "152.001");
		document
			.getElementById("canvas_for_icon_widgets")
			?.appendChild(score_deviation_plus);
		const csdp_ctx6 = canvas_student_logo.getContext("2d");
		csdp_ctx6?.drawImage(
			document.getElementById("student_logo")! as any,
			0,
			0,
			152.001,
			152.001
		);
		student_logo.src = canvas_student_logo.toDataURL("image/png", 0.5);

		//graph_title_image
		const canvas_gt_logo = document.createElement("canvas");
		canvas_gt_logo.setAttribute("width", "34.85");
		canvas_gt_logo.setAttribute("height", "34.85");
		document
			.getElementById("canvas_for_icon_widgets")
			?.appendChild(score_deviation_plus);
		const csdp_ctx7 = canvas_gt_logo.getContext("2d");
		csdp_ctx7?.drawImage(
			document.getElementById("gt_logo")! as any,
			0,
			0,
			34.85,
			34.85
		);
		graph_title_image.src = canvas_gt_logo.toDataURL("image/png", 0.5);

		//principal signature
		let principal_singature: any;
		if (
			options.signatures.principal &&
			options.signatureImages.principal.hasLogo
		) {
			principal_singature = document.createElement("canvas") as any;
			principal_singature.setAttribute("width", "100");
			principal_singature.setAttribute("height", "50");
			document
				.getElementById("canvas_for_icon_widgets")
				?.appendChild(score_deviation_plus);
			const csdp_ctx5 = principal_singature.getContext("2d");
			csdp_ctx5?.drawImage(
				document.getElementById("p_signature")! as any,
				0,
				0,
				100,
				50
			);
			principal_singature.src = principal_singature.toDataURL("image/png", 0.5);
		}

		//cteacher signature
		let cteacher_singature: any;
		if (
			options.signatures.teacher &&
			options.signatureImages.cteacher.hasLogo
		) {
			cteacher_singature = document.createElement("canvas") as any;
			cteacher_singature.setAttribute("width", "100");
			cteacher_singature.setAttribute("height", "50");
			document
				.getElementById("canvas_for_icon_widgets")
				?.appendChild(score_deviation_plus);
			const csdp_ctx5 = cteacher_singature.getContext("2d");
			csdp_ctx5?.drawImage(
				document.getElementById("ct_signature")! as any,
				0,
				0,
				100,
				50
			);
			cteacher_singature.src = cteacher_singature.toDataURL("image/jpeg", 0.5);
		}

		//  graph_title_image.src = "./assets_new/images/bar-graph.png";

		let bar_labels: any[] = [];
		let bar_data: any[] = [];
		const bar_canvas: any[] = [];
		let line_labels: any[] = [];
		let line_data_student: any[] = [];
		let line_data_class: any[] = [];
		const line_canvas: any[] = [];
		// for (let i = 0; i < 1; i++) { //original section
		for (let i = 0; i < content.list.length; i++) {
			//original section
			const object = content.list[i];
			// console.log(`${i} of ${content.list.length}`)
			//SECTION LINE GRAPH
			// create label data
			const subject_comparison = object.subject_comparison;
			for (let x = 0; x < subject_comparison.list_student.length; x++) {
				if (x == 0) {
					line_labels.push("" + subject_comparison.list_student[x].name);
				} else {
					line_labels.push(subject_comparison.list_student[x].name);
				}

				line_data_student.push(subject_comparison.list_student[x].value);
				line_data_class.push(subject_comparison.list_class[x].value);
			}
			// console.log(subject_comparison);
			const canvas_line = document.createElement("canvas");
			canvas_line.id = "line_" + i;
			document.getElementById("wrapper_line")?.appendChild(canvas_line);
			const ctx_line = canvas_line.getContext("2d")! as any;
			ctx_line.width = 400;
			ctx_line.height = 300;
			/**
			 * Highcarts Update. Performance agains't class
			 */
			let subject_div: any = document.createElement("div");
			subject_div.id = "subject_div";
			const hchart_subject_comparison = new Highcharts.Chart({
				tooltip: { shared: true },
				title: { text: "" },
				xAxis: {
					type: "category",
					categories: line_labels,
					tickmarkPlacement: "on",
					gridLineWidth: 2,

					gridLineColor: "rgba(228, 229, 231, 0.90)",
					labels: {
						x: 8,
						align: "right",
						//  rotation:-65,
						style: {
							textOverflow: "none",
							fontSize: "17px",
							marginLeft: "3px",
							marginRight: "3px",
							lineHeight: "22px",
							fontWeight: "bold",
							whiteSpace: "wrap",
							color: "#000000"
						}
					}
				},
				yAxis: {
					min: Math.floor(subject_comparison.min / 10) * 10,
					max: Math.ceil(subject_comparison.max / 10) * 10,
					tickInterval: 10,
					labels: {
						align: "right",
						x: -20,
						y: 5,
						style: {
							fontSize: "17px",
							lineHeight: "22px",
							color: "#000000",
							fontWeight: "bold"
						}
					},
					title: { text: "", align: "high" },
					gridLineColor: "rgba(228, 229, 231, 0.60)"
				},
				series: [
					{
						name: subject_comparison.name_student,
						pointPlacement: "on",
						data: line_data_student,
						type: "line",
						showInLegend: true,
						color: "rgb(98, 203, 49)",
						marker: { symbol: "circle" },
						zIndex: 2,
						animation: false
					},
					{
						name: subject_comparison.name_class,
						pointPlacement: "on",
						data: line_data_class,
						type: "area",
						showInLegend: true,
						color: "rgb(180, 180, 180)",
						marker: { symbol: "circle" },
						zIndex: 1,
						animation: false
					}
				],
				// size: {height: 380, width: 540},
				chart: {
					renderTo: subject_div.getAttribute("id")?.toString(),
					animation: false
				},
				boost: {
					enabled: true,
					seriesThreshold: 50,
					useGPUTranslations: false,
					usePreallocated: false
				},
				// plotOptions: {
				//     series: {
				//         animation: false
				//     }, column: {
				//         maxPointWidth: 50
				//     }
				// },
				legend: {
					layout: "horizontal",
					align: "right",
					verticalAlign: "top",
					floating: true,
					// backgroundColor: 'rgba(255, 255, 255, 0)',
					itemStyle: {
						fontSize: "17px"
					}
				},
				credits: {
					enabled: false
				},
				exporting: {
					sourceWidth: 600,
					sourceHeight: 380
				}
			});
			subject_div = null;
			const line_canvas_svg = hchart_subject_comparison.getSVG();
			$("#line_svg").html(line_canvas_svg);
			const data_line = new XMLSerializer().serializeToString(
				$("#line_svg svg").get(0)!
			);

			vl = await Canvg.from(ctx_line, data_line);
			vl.start();

			line_canvas.push(canvas_line);
			//SECTION BAR GRAPH
			//loop through the timeseries object
			const timeseries = object.timeseries;
			for (let j = 0; j < timeseries.examscombined.list.length; j++) {
				const select = timeseries.examscombined.list[j];
				//  console.log(select);
				bar_labels.push(select.name);
				bar_data.push(select.value);
			}
			////console.log({bl: bar_labels, bd: bar_data});
			//create a canvas and use it to create graph
			//  let canvas_bar = document.createElement("CANVAS");
			const canvas_bar = document.createElement("canvas");
			canvas_bar.id = "bar_" + i;

			//  canvas_bar.style.width = '1000px !important';
			//  canvas_bar.style.height = '1000px !important';
			document.getElementById("wrapper_bar")?.appendChild(canvas_bar); // adds the canvas to the body element

			const ctx = canvas_bar.getContext("2d") as any;
			ctx.width = 300;
			ctx.height = 300;

			// alert(ctx);
			/*new Chart(
		ctx, {
		type: 'bar',
		data: {
		labels: bar_labels,
		datasets: [
		{
		data: bar_data,
		backgroundColor: "#7cb5ec",
		borderColor: "#7cb5ec",
		highlightFill: "#7cb5ec",
		highlightStroke: "#7cb5ec", borderWidth: 1
		}
		]
		}, options: {
		responsive: true,
		maintainAspectRatio: true,
		aspectRatio: 2,
		devicePixelRatio: 1.5,
		responsiveAnimationDuration: 0,
		animation: {
		duration: 0
		},
		legend: {
		display: false
		}, scales: {
		min: 0,
		max: 100,
		yAxes: [{
		ticks: {
		min: Math.floor(parseFloat(timeseries.examscombined.min)),
		fontSize: 22,
		stepSize: 10,
		max: Math.ceil(parseFloat(timeseries.examscombined.max)),
		padding: 0,
		fontColor: '#000',
		fontStyle: 'bold'
		}
		}],
		xAxes: [{
		ticks: {
		fontSize: 22,
		padding: 0,
		fontColor: '#000',
		fontStyle: 'bold',
		autoSkip: false,
		minRotation: 25
		}
		}]
		}
		}
		});*/
			/**
			 * Highcarts Update. Performance over time
			 */
			let timeline_div: any = document.createElement("div");
			timeline_div.id = "timeline_div";
			const hchrt_timeline = new Highcharts.Chart({
				title: {
					text: ""
				},
				chart: {
					type: "column",
					renderTo: timeline_div.getAttribute("id")?.toString()
				},
				boost: {
					enabled: true,
					seriesThreshold: 50,
					useGPUTranslations: false,
					usePreallocated: false
				},
				xAxis: {
					categories: bar_labels,
					title: {
						text: null
					},
					tickmarkPlacement: "on",
					gridLineColor: "rgba(228, 229, 231, 0.60)",
					labels: {
						style: {
							width: 160,
							fontSize: "17px",
							lineHeight: "22px",
							fontWeight: "bold",
							color: "#000000"
						}
					}
				},
				yAxis: {
					min: Math.floor(parseInt(timeseries.examscombined.min) / 10) * 10,
					max: Math.ceil(parseInt(timeseries.examscombined.max) / 10) * 10,

					title: {
						text: null
					},
					labels: {
						style: {
							fontSize: "17px",
							lineHeight: "22px",
							fontWeight: "bold",
							color: "#000000"
						}
					}
				},
				series: [
					{
						type: "column",
						data: bar_data,
						animation: false
					}
				],

				// plotOptions: {
				//     series: {
				//         animation: false
				//     }, column: {
				//         maxPointWidth: 50
				//     }
				// },
				legend: {
					enabled: false
				},
				credits: {
					enabled: false
				},
				exporting: {
					sourceWidth: 1000,
					sourceHeight: 400
				}
			});
			timeline_div = null;
			// let bar_canvas_svg = hchrt_timeline.getSVG();
			// $('#bar_svg').html(bar_canvas_svg);
			// let data_bar = (new XMLSerializer()).serializeToString($('#bar_svg svg').get(0)!);

			// vb = await Canvg.from(ctx, data_bar);
			// vb.start();

			bar_canvas.push(canvas_bar);
			bar_labels = [];
			bar_data = [];
			line_labels = [];
			line_data_student = [];
			line_data_class = [];
			//}

			// for (let i = 0; i < 1; i++) {
			// for (let i = 0; i < content.list.length; i++) { //original loop design

			graph_subject_performance_img.src = line_canvas[i].toDataURL(
				"image/jpeg",
				0.5
			);
			graph_student_performance_img.src = bar_canvas[i].toDataURL(
				"image/jpeg",
				0.5
			);
			// alert(bar_chart.data.datasets[0].data[0]);
			const report_data = content.list[i];
			//---------------------------------------------------
			//  This section works when the school has a logo
			//---------------------------------------------------
			// let show_with_logo = true;
			console.log(options);
			if (options.school.hasLogo) {
				//get school logo size
				//all have a constant height of 120px
				const imageWidth =
					(document.getElementById("sch_logo") as any).width >= 98
						? pxToMm(98)
						: pxToMm((document.getElementById("sch_logo") as any).width);

				//school logo
				try {
					d.addImage(school_logo_image, 165.152, 3.8, imageWidth, 26.448);
				} catch (error) {
					console.warn(error);
				}
				//set the school name & address
				d.setFontSize(16);
				d.text(options.school.name, 15.4, 13); //school name
				d.setFontSize(12);
				d.text(options.school.address, 15.4, 19); //p-o-box
				d.text(options.school.phone, 15.4, 24); // phone number
				d.text(options.school.email, 15.4, 29); // email address
			}
			//---------------------------------------------------
			//  This section works when the school lacks a logo
			//---------------------------------------------------
			else {
				d.setFontSize(16);
				d.text(options.school.name, 105, 13, { align: "center" }); //school name
				d.setFontSize(12);
				d.text(options.school.address, 105, 19, { align: "center" }); //p-o-box
				d.text(options.school.phone, 105, 24, { align: "center" }); // phone number
				d.text(options.school.email, 105, 29, { align: "center" }); // email address
			}

			//draw a separator line
			d.setDrawColor("#62cb31");
			d.setLineWidth(0.5);
			d.line(15.4, 32.248, 196.6, 32.248);

			//report card details. Form - exam name - (year Term 3)
			d.setFontSize(10);
			d.setTextColor("#000");
			d.text(report_data.examname, 14.6, 37.25); //exam information

			//student details section
			// if student url is set
			if (report_data.url !== null && report_data.url.length > 4) {
				const ig1 = new Image();
				ig1.crossOrigin = "Anonymous";
				ig1.src = report_data.url;
				d.addImage(ig1, 17.2, 40.3, 38.517, 38.717);
				d.setLineWidth(2.4);
				d.setDrawColor("white");
				d.roundedRect(16.3, 39.75, 40.317, 40.217, 5, 5, "S");
			}
			// else
			else {
				d.addImage(student_logo, 17.2, 40.3, 38.517, 38.717); //student logo holder
				d.setLineWidth(2.4);
				d.setDrawColor("white");
				d.roundedRect(16.3, 39.75, 40.317, 40.217, 5, 5, "S");
			}
			d.setFontSize(9);
			d.setTextColor("#000");
			d.text("NAME : " + report_data.studentname, 15.4, 83.4); //name
			d.text("ADMNO: " + report_data.admno, 15.4, 88.4); // amdno
			d.text("FORM : " + report_data.examclassname, 15.4, 93.4); // form
			if (report_data.kcpe !== undefined && report_data.kcpe !== null) {
				d.text("KCPE : " + report_data.kcpe, 15.4, 98.4); // KCPE
			}
			if (report_data.vap !== undefined && report_data.vap !== null) {
				d.text("VAP : " + report_data.vap, 36.4, 98.4); // VAP
			}

			//section-exam-details
			//total marks
			d.setFontSize(9);
			d.setTextColor("#000");
			d.text("Total Marks", 62.217, 43.75);
			d.setTextColor("#2ea5de"); //#62cb31
			d.setFontSize(14);
			d.text(
				report_data.aggregate_stats.first.value.toString(),
				textWidth(report_data.aggregate_stats.first.value.toString(), 9) +
					5 +
					62.217,
				48.75,
				{ align: "right" }
			); //student score
			d.setTextColor("#000");
			d.text(
				" / " + report_data.aggregate_stats.first.out_of,
				textWidth(report_data.aggregate_stats.first.value.toString(), 9) +
					5 +
					62.217,
				48.75
			); //total subjects75.217
			d.setFontSize(9);
			d.setTextColor("#000");

			let igtm: any = null;
			let deviationtm = report_data.aggregate_stats.first.change.toString();
			if (report_data.aggregate_stats.first.change === 0) {
				igtm = score_deviation_plain;
			} else if (report_data.aggregate_stats.first.change < 0) {
				igtm = score_deviation_minus;
			} else {
				deviationtm = "+" + deviationtm;
				igtm = score_deviation_plus;
			}
			d.text(deviationtm, 70.217, 53.75, { align: "center" }); //deviation
			d.addImage(
				igtm,
				textWidth(report_data.aggregate_stats.first.change.toString(), 9) +
					70.217 +
					1,
				50.75,
				3.44,
				3.44
			); //deviation logo //77.217
			//mean marks section
			d.setFontSize(9);
			d.setTextColor("#000");
			d.text("Mean Marks", 90.217, 43.75);
			d.setTextColor("#2ea5de"); //#80cb31
			d.setFontSize(14);
			let surffix = "";
			if (
				report_data.aggregate_stats.second.suffix !== undefined &&
				report_data.aggregate_stats.second.suffix !== null
			) {
				surffix = report_data.aggregate_stats.second.suffix;
			}
			d.text(
				report_data.aggregate_stats.second.value.toString() + surffix,
				93.217,
				48.75
			); //student score %
			if (report_data.aggregate_stats.second.change === 0) {
				igtm = score_deviation_plain;
			} else if (report_data.aggregate_stats.second.change < 0) {
				igtm = score_deviation_minus;
			} else {
				igtm = score_deviation_plus;
			}
			d.addImage(igtm, 96.657, 50.75, 3.44, 3.44); //deviation logo

			//draw line separator
			d.setDrawColor("#e4e5e7");
			d.setLineWidth(0.1);
			d.line(63.217, 55.75, 107.217, 55.75);

			//section-exam-details
			//total marks
			d.setFontSize(9);
			d.setTextColor("#000");
			d.text("Total Points", 62.217, 59.75);
			d.setTextColor("#2ea5de");
			d.setFontSize(14);
			d.text(
				report_data.aggregate_stats.third.value.toString(),
				textWidth(report_data.aggregate_stats.third.value.toString(), 9) +
					5 +
					62.217,
				64.75,
				{ align: "right" }
			); //student score points
			d.setTextColor("#000");
			d.text(
				" / " + report_data.aggregate_stats.third.out_of,
				textWidth(report_data.aggregate_stats.third.value.toString(), 9) +
					5 +
					62.217,
				64.75
			); //total subjects//70.217
			d.setFontSize(9);
			let deviationmt = report_data.aggregate_stats.third.change.toString();
			if (report_data.aggregate_stats.third.change === 0) {
				igtm = score_deviation_plain; //deviation logo
			} else if (report_data.aggregate_stats.third.change < 0) {
				igtm = score_deviation_minus;
			} else {
				deviationmt = "+" + report_data.aggregate_stats.third.change.toString();
				igtm = score_deviation_plus;
			}
			d.text(deviationmt, 70.217, 69.75, { align: "center" }); //deviation
			d.addImage(
				igtm,
				"png",
				textWidth(report_data.aggregate_stats.third.change.toString(), 9) +
					70.217 +
					1,
				66.75,
				3.44,
				3.44,
				undefined,
				"FAST"
			); //deviation logo//77.217
			//mean marks section
			d.setFontSize(9);
			d.setTextColor("#000");
			d.text("Mean Grade", 90.217, 59.75);
			d.setTextColor("#2ea5de");
			d.setFontSize(14);
			d.text(
				report_data.aggregate_stats.fourth.value.toString(),
				95.217,
				66.75
			); //student mean grade scor
			//draw line separator
			d.setDrawColor("#e4e5e7");
			d.setLineWidth(0.1);
			d.line(63.217, 71.75, 105.217, 71.75);

			//stream & overal position
			//overall position
			d.setFontSize(9);
			d.setTextColor("#000");
			d.text("Overall Position", 62.217, 75.75);
			d.setTextColor("#2ea5de");
			d.setFontSize(14);
			if (
				report_data.aggregate_stats.fifth.out_of !== undefined &&
				report_data.aggregate_stats.fifth.out_of !== null
			) {
				d.text(
					report_data.aggregate_stats.fifth.value.toString(),
					textWidth(report_data.aggregate_stats.third.value.toString(), 9) +
						5 +
						62.217,
					80.75,
					{ align: "right" }
				); //student position
			} else {
				d.text(
					report_data.aggregate_stats.fifth.value.toString(),
					textWidth(report_data.aggregate_stats.third.value.toString(), 9) +
						5 +
						62.217,
					80.75,
					{ align: "right" }
				); //student position
			}
			d.setTextColor("#000");
			if (
				report_data.aggregate_stats.fifth.out_of !== undefined &&
				report_data.aggregate_stats.fifth.out_of !== null
			) {
				d.text(
					" / " + report_data.aggregate_stats.fifth.out_of,
					textWidth(report_data.aggregate_stats.third.value.toString(), 9) +
						5 +
						62.217,
					80.75,
					{ align: "left" }
				); //total position
				d.setFontSize(9);
				d.setTextColor("#000");
			}

			let ig;
			if (report_data.aggregate_stats.fifth.change === undefined) {
				report_data.aggregate_stats.fifth.change = 0;
			}
			let deviation = report_data.aggregate_stats.fifth.change.toString();
			if (report_data.aggregate_stats.fifth.change === 0) {
				ig = score_deviation_plain;
			} else if (report_data.aggregate_stats.fifth.change < 0) {
				ig = score_deviation_minus;
			} else {
				deviation = "+" + deviation;
				ig = score_deviation_plus;
			}
			d.text(
				deviation,
				textWidth(report_data.aggregate_stats.third.change.toString(), 9) +
					70.217 +
					1,
				85.75,
				{ align: "right" }
			); //deviation
			d.addImage(
				ig,
				textWidth(report_data.aggregate_stats.third.change.toString(), 9) +
					70.217 +
					1,
				82.75,
				3.44,
				3.44
			); //deviation logo

			//stream position section
			d.setFontSize(9);
			d.setTextColor("#000");
			d.text("Stream Position", 90.217, 75.75);
			d.setTextColor("#2ea5de");
			d.setFontSize(14);
			if (report_data.aggregate_stats.sixth !== undefined) {
				d.text(
					report_data.aggregate_stats.sixth.value.toString(),
					textWidth(report_data.aggregate_stats.sixth.change.toString(), 9) +
						5 +
						90.217,
					80.75,
					{ align: "right" }
				); //student stream position
			} else {
				d.text("-", 98.217, 82.75, { align: "center" }); //student stream position
			}
			d.setTextColor("#000");
			if (report_data.aggregate_stats.sixth !== undefined) {
				d.text(
					" / " + report_data.aggregate_stats.sixth.out_of,
					textWidth(report_data.aggregate_stats.sixth.change.toString(), 9) +
						5 +
						90.217,
					80.75
				); //total position100.217

				d.setFontSize(9);
				d.setTextColor("#000");
				let deviation = report_data.aggregate_stats.sixth.change.toString();
				if (report_data.aggregate_stats.sixth.change === 0) {
					ig = score_deviation_plain;
				} else if (report_data.aggregate_stats.sixth.change < 0) {
					ig = score_deviation_minus;
				} else {
					deviation = "+" + deviation;
					ig = score_deviation_plus;
				}
				d.text(
					deviation,
					textWidth(report_data.aggregate_stats.sixth.change.toString(), 9) +
						95.217,
					85.75,
					{ align: "right" }
				); //deviation
				d.addImage(
					ig,
					textWidth(report_data.aggregate_stats.sixth.change.toString(), 9) +
						95.217 +
						1,
					82.75,
					3.44,
					3.44
				); //deviation logo
			}

			//Graph Section
			//graph title
			d.setFontSize(9);
			d.addImage(graph_title_image, 120, 40.75, 3.44, 3.44);
			d.text("Subject Performance - Student vs. Class", 125, 43.75);
			//graph student progress
			d.addImage(
				graph_subject_performance_img,
				"jpeg",
				115,
				46.75,
				80,
				49,
				undefined,
				"FAST"
			);

			//************************************
			// This is the exam table section CASE 1: NO Aditional Exams
			// report_data.subjects.additional_exams.length = 0
			//*************************************
			let y_coordinate_table = 110.9;
			y_coordinate_table = y_coordinate_table - 3;

			if (report_data.kcpe === undefined || report_data.kcpe === null) {
				y_coordinate_table = y_coordinate_table - 5;
			}
			if (report_data.subjects.additional_exams.length === 0) {
				//table header
				d.setDrawColor("#000");
				d.setLineWidth(0.5);
				d.rect(15.4, y_coordinate_table - 6.5, 36, 6.5); //104.4 y_coordinate_table - 104.4 = 6.5
				d.text("SUBJECT", 16.9, y_coordinate_table - 1.5); //109.4 y_coordinate_table - 109.4 = 1.5

				d.rect(51.4, y_coordinate_table - 6.5, 20, 6.5); //104.4
				d.text("MARKS", 52.9, y_coordinate_table - 1.5); //109.4

				d.rect(71.4, y_coordinate_table - 6.5, 15, 6.5); //104.4
				d.text("DEV", 72.9, y_coordinate_table - 1.5); //109.4

				d.rect(86.4, y_coordinate_table - 6.5, 20, 6.5); //104.4
				d.text("GRADE", 87.9, y_coordinate_table - 1.5); //109.4

				d.rect(106.4, y_coordinate_table - 6.5, 15, 6.5); //104.4
				d.text("RANK", 107.9, y_coordinate_table - 1.5); //109.4

				d.rect(121.4, y_coordinate_table - 6.5, 50, 6.5); //104.4
				d.text("COMMENT", 122.9, y_coordinate_table - 1.5); //109.4

				d.rect(171.4, y_coordinate_table - 6.5, 30, 6.5); //104.4
				d.text("TEACHER", 172.9, y_coordinate_table - 1.5); //109.4
				//table body
				//------------------
				d.setFontSize(8);
				// the y value for the table cell increases by 6.5,
				//the y value for the text increases by 5

				for (let a = 0; a < report_data.subjects.list.length; a++) {
					d.setFontSize(8);
					const subject = report_data.subjects.list[a];
					if (a === 0) {
						//console.log(subject);
					}
					d.rect(15.4, y_coordinate_table, 36, 6.5);
					d.text(subject.subject, 16.9, y_coordinate_table + 5); //sibject name

					d.rect(51.4, y_coordinate_table, 20, 6.5);
					d.text(subject.value.toString(), 52.9, y_coordinate_table + 5); //score

					d.rect(71.4, y_coordinate_table, 15, 6.5);
					let deviation = subject.change.toString();
					if (subject.change === 0) {
						ig = score_deviation_plain;
					} else if (subject.change < 0) {
						ig = score_deviation_minus;
					} else {
						ig = score_deviation_plus;
						deviation = "+" + deviation;
					}
					d.text(deviation, 72.9, y_coordinate_table + 5); //deviation
					d.addImage(ig, 82.46, y_coordinate_table + 3.1, 2.44, 2.44); //deviation logo

					d.rect(86.4, y_coordinate_table, 20, 6.5);
					d.text(subject.grade, 87.9, y_coordinate_table + 5); //grade

					d.rect(106.4, y_coordinate_table, 15, 6.5);
					d.text(
						subject.sbj_rank + " / " + subject.sbj_rank_outof,
						107.9,
						y_coordinate_table + 5
					); //rank

					d.rect(121.4, y_coordinate_table, 50, 6.5);
					d.text(subject.comment, 122.9, y_coordinate_table + 5); //comment

					d.rect(171.4, y_coordinate_table, 30, 6.5);
					let teacher = "";
					if (subject.st === undefined) {
						teacher = "";
					} else {
						teacher = subject.st;
					}
					d.text(teacher, 172.9, y_coordinate_table + 5); //teacher
					y_coordinate_table += 6.5;
				}
				//value of y after looping, = y+6.5
				y_coordinate_table += 6.5;
			}

			//************************************
			// This is the exam table section CASE 2: NO Aditional Exams
			// report_data.subjects.additional_exams.length > 0
			//*************************************
			if (report_data.subjects.additional_exams.length > 0) {
				//create an array to hold all our x co_ordinates
				//create an array to hold all our x_text co_ordinates
				//create an array to hold all our x cell widths
				d.setFontSize(7.6);
				d.setDrawColor("#000");
				d.setLineWidth(0.5);

				d.rect(15.4, y_coordinate_table - 6.5, 36, 11.0); //104.4 y_coordinate_table - 104.4 = 6.5
				d.text("SUBJECT", 16.9, y_coordinate_table + 3); //113.9 y_coordinate_table - 113.9 = -3
				let table_cell_x = 51.4;
				//loop through the additional exams array
				for (let v = 0; v < report_data.subjects.additional_exams.length; v++) {
					const additional_exam = report_data.subjects.additional_exams[v];
					//if the exam name length > 7, break the string into two, concatenate with \n
					//if the exam name length < 7, use it as normal
					if (additional_exam.name.length > 7) {
						const temp_name = additional_exam.name;
						const parts = temp_name.match(/.{1,10}/g);
						parts.join("\n");
						additional_exam.name = parts.join("\n");
					}
					d.setFontSize(7);
					d.rect(table_cell_x, y_coordinate_table - 6.5, 15, 11.0); //104.4
					const ratio_text =
						additional_exam.percentage === 100
							? ""
							: "(x/" + additional_exam.percentage.toString() + ")";
					d.text(
						additional_exam.name.toString(),
						table_cell_x + 2,
						y_coordinate_table + 1,
						undefined,
						22.5
					); //111.9 y_coordinate_table - 111.9 =  - 1.0

					d.text(
						ratio_text,
						table_cell_x + 7.8,
						y_coordinate_table + 3.452083,
						{ align: "left" }
					); //(112.4 + 1.952083) y_coordinate_table - (112.4 + 1.952083) =   −3.452083

					table_cell_x += 15;
				}
				d.setFontSize(8);
				d.rect(table_cell_x, y_coordinate_table - 6.5, 33, 5.5); //55, 104.4
				d.text(
					report_data.current_exam,
					table_cell_x + 2,
					y_coordinate_table - 2.5
				); //108.4 y_coordinate_table - 109.9 =   2.5

				d.rect(table_cell_x, y_coordinate_table - 1, 11, 5.5); //45.4 109.9, y_coordinate_table - 109.9 =   1.0
				d.text("MRKS.", table_cell_x + 1, y_coordinate_table + 3); //47.4 //113.9

				d.rect(table_cell_x + 11, y_coordinate_table - 1, 13, 5.5); //109.9
				d.text("DEV.", table_cell_x + 11 + 1, y_coordinate_table + 3); //113.9

				d.rect(table_cell_x + (11 + 13), y_coordinate_table - 1, 9, 5.5); //109.9
				d.text("GR.", table_cell_x + (11 + 13) + 1, y_coordinate_table + 3); //113.9

				d.rect(table_cell_x + 11 * 3, y_coordinate_table - 6.5, 11, 11.0); //104.4
				d.text("RANK", table_cell_x + 11 * 3 + 1, y_coordinate_table + 3); //113.9

				//get the remaining width in the document
				//once we have it, comment section will occupy 65% of it, teachers will occupy remaining 35%
				//calculate remaining width
				const current_x_position = table_cell_x + 11 * 4;
				let last_x_position = 205.6;
				const current_space = last_x_position - current_x_position;
				if (report_data.subjects.additional_exams.length > 3) {
					last_x_position = 205.6;
				}

				//comments width
				const comments_section_width = current_space * 0.6;
				const teachers_section_width = current_space * 0.3;

				const comments_Section_x_coordinate = current_x_position;
				const teachers_Section_x_coordinate =
					comments_Section_x_coordinate + comments_section_width;

				d.rect(
					comments_Section_x_coordinate,
					y_coordinate_table - 6.5,
					comments_section_width,
					11.0
				); //104.4
				d.text(
					"COMMENT",
					comments_Section_x_coordinate + 1,
					y_coordinate_table + 3
				); //113.9

				d.rect(
					teachers_Section_x_coordinate,
					y_coordinate_table - 6.5,
					teachers_section_width,
					11.0
				); //104.4
				d.text(
					"TEACHER",
					teachers_Section_x_coordinate + 1,
					y_coordinate_table + 3
				); //113.9

				//let us now create our data
				//--------------------------------------
				//  SECTION MARKS DATA
				//--------------------------------------
				y_coordinate_table = y_coordinate_table + 4.5; //115.4;
				//tbody
				for (let a = 0; a < report_data.subjects.list.length; a++) {
					const subject = report_data.subjects.list[a];

					//loop through the collumns
					//subject area
					d.rect(15.4, y_coordinate_table, 36, 6.5);
					d.text(subject.subject, 16.9, y_coordinate_table + 5); //sibject name
					let table_cell_x = 51.4;
					//loop through the additional exams array
					for (
						let v = 0;
						v < report_data.subjects.additional_exams.length;
						v++
					) {
						const additional_exam = report_data.subjects.additional_exams[v];
						const x = additional_exam.seriesid.toString();
						let marks = "-";
						if (subject["additional_results"][x] !== undefined) {
							marks = subject["additional_results"][x].toString();
						}
						d.rect(table_cell_x, y_coordinate_table, 15, 6.5);
						d.text(
							marks.toString(),
							table_cell_x + 2,
							y_coordinate_table + 5,
							undefined,
							0
						);
						table_cell_x += 15;
					}
					d.rect(table_cell_x, y_coordinate_table, 11, 6.5); //45.4
					d.text(
						subject.value.toString(),
						table_cell_x + 1,
						y_coordinate_table + 5
					); //47.4 //subject marks

					d.rect(table_cell_x + 11, y_coordinate_table, 13, 6.5);
					//deviation section
					let deviation = subject.change.toString();
					if (subject.change === 0) {
						ig = score_deviation_plain;
					} else if (subject.change < 0) {
						ig = score_deviation_minus;
					} else {
						deviation = "+" + deviation;
						ig = score_deviation_plus;
					}

					d.text(deviation, table_cell_x + 11 + 1, y_coordinate_table + 5); //deviation
					d.addImage(
						ig,
						table_cell_x + 9.56 + 11,
						y_coordinate_table + 3.1,
						2.44,
						2.44
					); //deviation logo

					d.rect(table_cell_x + (11 + 13), y_coordinate_table, 9, 6.5);
					d.text(
						subject.grade,
						table_cell_x + (11 + 13) + 1,
						y_coordinate_table + 5
					);

					d.rect(table_cell_x + 11 * 3, y_coordinate_table, 11, 6.5);
					d.text(
						subject.sbj_rank.toString() +
							"/" +
							subject.sbj_rank_outof.toString(),
						table_cell_x + 11 * 3 + 1,
						y_coordinate_table + 5
					);
					d.rect(
						comments_Section_x_coordinate,
						y_coordinate_table,
						comments_section_width,
						6.5
					);
					d.setFontSize(7);
					d.text(
						subject.comment,
						comments_Section_x_coordinate + 1,
						y_coordinate_table + 5
					);
					let teacher = "-";
					if (subject.st === undefined) {
						teacher = "-";
					} else {
						teacher = subject.st;
					}
					d.rect(
						teachers_Section_x_coordinate,
						y_coordinate_table,
						teachers_section_width,
						6.5
					);
					d.text(
						teacher,
						teachers_Section_x_coordinate + 1,
						y_coordinate_table + 5
					);
					d.setFontSize(8);
					y_coordinate_table += 6.5;
				}
				y_coordinate_table += 6.5;
			}

			//**********************************************
			//  SECTION TEST USER'S PERFORMANCE OVER TIME
			//**********************************************
			d.setFontSize(9);
			// d.setFontType("bold");
			d.text(
				report_data.studentname + "'s Performance Over Time",
				15.4,
				y_coordinate_table
			);
			d.addImage(
				graph_student_performance_img,
				"jpeg",
				15.4,
				y_coordinate_table + 2.5,
				169.2,
				47.5,
				undefined,
				"FAST"
			);

			//add a padding bottom of 5
			y_coordinate_table += 55;
			d.setFontSize(9);
			// d.setFontType("bold");
			//remarks section
			let cteacher = "";
			if (
				report_data.classteacher !== undefined &&
				report_data.classteacher.name !== undefined
			) {
				cteacher = "- " + report_data.classteacher.name;
			}
			d.text("Class Teachers remarks " + cteacher, 15.4, y_coordinate_table);
			if (
				options.signatures.teacher &&
				options.signatureImages.cteacher.hasLogo
			) {
				d.text("Signature", 196.6, y_coordinate_table - 2.5, {
					align: "right"
				});
				d.addImage(
					cteacher_singature,
					182.5,
					y_coordinate_table - 1.5,
					15,
					7.8
				); //cteacher signature
			}
			y_coordinate_table += 5;
			d.setFontSize(8);
			if (
				options.remarks.cteacher.showRemark &&
				report_data.ct_remarks !== null &&
				report_data.ct_remarks.length > 0
			) {
				d.text(report_data.ct_remarks, 16.4, y_coordinate_table); //teacher comment
			}

			y_coordinate_table += 1;
			d.setDrawColor("#3f3f3");
			d.setLineDash([0.5, 0.5], 0);
			d.line(15.4, y_coordinate_table, 196.6, y_coordinate_table);

			y_coordinate_table += 6;
			d.setFontSize(9);
			//Principals remarks
			// d.setFontType("bold");
			//
			d.text(
				options.school.principalTitle +
					"'s remarks - " +
					options.school.principalName,
				15.4,
				y_coordinate_table
			);

			if (
				options.signatures.principal &&
				options.signatureImages.principal.hasLogo
			) {
				d.text("Signature", 196.6, y_coordinate_table - 2.5, {
					align: "right"
				});
				d.addImage(
					principal_singature,
					182.5,
					y_coordinate_table - 1.5,
					15,
					7.8
				); //principal signature
			}
			y_coordinate_table += 5;
			d.setFontSize(8);
			if (
				options.remarks.principal.showRemark &&
				report_data.p_remarks !== null &&
				report_data.p_remarks.length > 0
			) {
				d.text(report_data.p_remarks, 16.4, y_coordinate_table); //principal comments
			}

			y_coordinate_table += 1;
			d.setDrawColor("#3f3f3");
			d.setLineDash([0.5, 0.5], 0);
			d.line(15.4, y_coordinate_table, 196.6, y_coordinate_table);
			d.setFontSize(9);
			y_coordinate_table += 6.5;
			//balances section
			if (options.balances.isset) {
				const admno = report_data.admno;
				if (
					JSON.stringify(options.balances.data).length > 2 &&
					options["balances"]["data"][admno] !== undefined
				) {
					const balance = options["balances"]["data"][admno]["TERM_BALANCE"];
					const total_balance = balance
						.toFixed(2)
						.replace(/\d(?=(\d{3})+\.)/g, "$&,");
					d.text("This Term's Balance:", 15.4, y_coordinate_table);
					d.text(total_balance, 74.2, y_coordinate_table, { align: "right" }); //current term balance
					d.setLineDash([0.5, 0.5], 0);
					d.setDrawColor("#000");
					d.line(
						72.2 - textWidth("5,000", "9px"),
						y_coordinate_table + 2,
						74.2,
						y_coordinate_table + 2
					); //line under term balance
				}
			}

			//date section
			if (options.dates.closing.isset) {
				d.text("School Closed On:", 115.4, y_coordinate_table);
				// console.warn("options.dates.closing.date >> ", options);
				d.text(options.dates.closing.date, 196.6, y_coordinate_table, {
					align: "right"
				}); //current term closing date
				d.setLineDash([0.5, 0.5], 0);
				d.setDrawColor("#000");
				d.line(
					190.6 - textWidth(options.dates.closing.date, "9px"),
					y_coordinate_table + 2,
					196.6,
					y_coordinate_table + 2
				); //line under current term closing date
				y_coordinate_table += 6.5;
			}

			//date section
			if (options.dates.opening.isset) {
				y_coordinate_table += 6.5;
				d.text("Next Term Begins on:", 115.4, y_coordinate_table);
				// console.warn("options.dates.opening.date >> ", options.dates.opening.date);
				d.text(options.dates.opening.date, 196.6, y_coordinate_table, {
					align: "right"
				}); //next term begin date
				d.setLineDash([0.5, 0.5], 0);
				d.setDrawColor("#000");
				d.setLineWidth(0.5);
				d.line(
					190.6 - textWidth(options.dates.opening.date, "9px"),
					y_coordinate_table + 2,
					196.6,
					y_coordinate_table + 2
				); //line under next term begin date
			}

			//payment section
			if (options.balances.isset) {
				const admno = report_data.admno;
				if (
					JSON.stringify(options.balances.data).length > 2 &&
					options["balances"]["data"][admno] !== undefined
				) {
					d.text("Next Term's Fees:", 15.4, y_coordinate_table);
					const balance = options["balances"]["data"][admno]["TERM_BALANCE"];
					let next_fee = options["balances"]["data"][admno]["NEXT_TERM_FEES"];
					const total_payable = parseInt(next_fee) + parseInt(balance);
					const total = total_payable
						.toFixed(2)
						.replace(/\d(?=(\d{3})+\.)/g, "$&,");
					next_fee = next_fee.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
					d.text(next_fee, 74.2, y_coordinate_table, { align: "right" }); //next term fees date
					d.line(
						74.2 - textWidth(next_fee, "9px"),
						y_coordinate_table + 2,
						74.2,
						y_coordinate_table + 2
					); //line under next term balance
					// d.setLineDash([0, 0], 0);
					d.setLineWidth(0.3);
					d.setDrawColor("#f3f3f3");
					d.line(20.4, y_coordinate_table + 2, 74.2, y_coordinate_table + 2); //divider for fee statements

					y_coordinate_table += 6.5;
					d.text("Total Fees Payable:", 15.4, y_coordinate_table);
					d.text(total, 74.2, y_coordinate_table, { align: "right" }); //total fees payable
					// d.setLineDash([0.5, 0.5], 0);
					d.setDrawColor("#000");
					d.setLineWidth(0.5);
					d.line(
						70.2 - textWidth("31,000", "9px"),
						y_coordinate_table + 2,
						74.2,
						y_coordinate_table + 2
					); //line under total fees payable
				}
			}
			//parent section
			if (options.signatures.parent) {
				const admno = report_data.admno;
				if (options["balances"]["data"][admno] === undefined) {
					y_coordinate_table += 6.5;
				}
				d.text("Parent's Signature", 115.4, y_coordinate_table);
				y_coordinate_table += 1.5;
				d.line(145.4, y_coordinate_table, 196.6, y_coordinate_table);
			}

			d.setDrawColor("#3f3f3");
			y_coordinate_table += 1;
			// d.setLineDash([0.5, 0.5], 0);
			d.setLineWidth(0.1);
			d.setDrawColor("#000");

			//origian section
			if (i + 1 < content.list.length) {
				d.addPage();
			}
			//console.log("");
		}
		//save the document
		// d.output('save', 'filename.pdf')
		d.save(options.docName + ".pdf", { returnPromise: true }).then((resp) => {
			console.warn("resp >> ", resp);
			// this.toastService.success("Report Forms downloaded successfully "),
			vl.stop(), vb.stop();
			// return of('Complete');
			//   notify({
			//     message: "Report Forms downloaded successfully ",
			//     classes: "alert-success",
			//     templateUrl: homerTemplate2
			// })
			// console.warn("");
		});
		// return of('Failed');
		// $('#loading_section').css("display", "none");
		// //clear the contents of the div
		// $('#wrapper_line').html('');
		// $('#wrapper_bar').html('');
		// $('#bar_svg').html('');
		// $('#line_svg').html('');
	}

	// TODO: optimize and refactor
	async generateMeritListPdfReport(
		school: any,
		logo: any,
		title: string,
		tables: { table: any[]; tableWidths?: any[]; isGenderData: boolean }[],
		pageSize = "A4"
	) {
		PdfMakeWrapper.setFonts(pdfFonts);
		const pdf = new PdfMakeWrapper();
		// pdf.pageOrientation("portrait");
		pdf.pageOrientation("landscape");
		pdf.defaultStyle({
			fontSize: 6,
			bold: true
		});
		pdf.pageSize(pageSize);

		// console.warn(school.name, title);
		const schoolNameNode = new Txt(school.name)
			.fontSize(16)
			.bold()
			.alignment("center").end;
		const titleNode = new Txt(title)
			.fontSize(12)
			.color("#673ab7")
			.alignment("center").end;
		const schoolAddress = new Txt(school.address || "")
			.fontSize(11)
			.alignment("right").end;
		const schoolPhone = new Txt(school.phone || "")
			.fontSize(11)
			.alignment("right").end;
		const schoolEmail = new Txt(school.email || "")
			.fontSize(11)
			.alignment("right").end;

		let logoNode: any;
		try {
			logoNode = await new Img(`${logo}?cacheblock=true`)
				.fit([60, 60])
				.alignment("left")
				.build();
		} catch (error) {
			logoNode = await new Img("../../../../assets/img/sig_default.jpg")
				.fit([60, 60])
				.alignment("left")
				.build();
		}

		// let logoNode = await new Img(logo).fit([60, 60]).alignment("left").build();
		// let logoNode = await new Img("../../../../assets/img/default-logo.png").fit([60, 60]).alignment("left").build();

		pdf.add(
			new Columns([
				[logoNode],
				[schoolNameNode, titleNode],
				[schoolAddress, schoolPhone, schoolEmail]
			]).columnGap(5).end
		);

		pdf.add(new Table([[], [], [], []]).end);

		// merit list table
		pdf.add(
			new Table(tables[0].table)
				.headerRows(2)
				.widths(tables[0].tableWidths ?? "auto")
				.layout({
					fillColor: function (i) {
						if (i === 0 || i === 1) {
							return "#eeeeff";
						}
						return "#fff";
					},
					hLineWidth: (i) => {
						// if (i === 0 || i === 1) {
						// 	return 0;
						// }
						return 1;
					},
					vLineWidth: function () {
						return 1;
					},
					hLineColor: function () {
						return "#000000";
					},
					vLineColor: function () {
						return "#000000";
					},
					paddingTop: function () {
						return 4;
					},
					paddingBottom: () => {
						return 4;
					}
				}).end
		);

		// grade breakdown table
		pdf.add(
			new Table(tables[1].table)
				.headerRows(2)
				.widths(tables[1].tableWidths ?? "auto")
				.layout({
					fillColor: function (i) {
						if (i === 0 || i === 1) {
							return "#eeeeff";
						}
						return "#fff";
					},
					hLineWidth: (i) => {
						// if (i === 0 || i === 1) {
						// 	return 0;
						// }
						return 1;
					},
					vLineWidth: function () {
						return 1;
					},
					hLineColor: function () {
						return "#000000";
					},
					vLineColor: function () {
						return "#000000";
					},
					paddingTop: function () {
						return 4;
					},
					paddingBottom: () => {
						return 4;
					}
				})
				.margin([0, 20, 0, 0]).end // LTRB
		);

		// gender grade summary table
		if (tables[2].isGenderData) {
			pdf.add(
				new Table(tables[2].table)
					.headerRows(2)
					.widths(tables[2].tableWidths ?? "auto")
					.layout({
						fillColor: function (i) {
							if (i === 0 || i === 1) {
								return "#eeeeff";
							}
							return "#fff";
						},
						hLineWidth: (i) => {
							// if (i === 0 || i === 1) {
							// 	return 0;
							// }
							return 1;
						},
						vLineWidth: function () {
							return 1;
						},
						hLineColor: function () {
							return "#000000";
						},
						vLineColor: function () {
							return "#000000";
						},
						paddingTop: function () {
							return 4;
						},
						paddingBottom: () => {
							return 4;
						}
					})
					.margin([0, 20, 0, 0]).end // LTRB
			);
		}

		// class grade summary table
		pdf.add(
			new Table(tables[3].table)
				.headerRows(2)
				.widths(tables[3].tableWidths ?? "auto")
				.layout({
					fillColor: function (i) {
						if (i === 0 || i === 1) {
							return "#eeeeff";
						}
						return "#fff";
					},
					hLineWidth: (i) => {
						// if (i === 0 || i === 1) {
						// 	return 0;
						// }
						return 1;
					},
					vLineWidth: function () {
						return 1;
					},
					hLineColor: function () {
						return "#000000";
					},
					vLineColor: function () {
						return "#000000";
					},
					paddingTop: function () {
						return 4;
					},
					paddingBottom: () => {
						return 4;
					}
				})
				.margin([0, 20, 0, 0]).end // LTRB
		);

		return pdf.create();
	}

	// olevel exam assessment
	async generateOlevelExamPdfReport(
		school: any,
		logo: any,
		title: string,
		tables: Array<{ table: any[]; tableWidths?: any[] }>,
		pageSize = "A4"
	) {
		PdfMakeWrapper.setFonts(pdfFonts);
		const pdf = new PdfMakeWrapper();
		// pdf.pageOrientation("portrait");
		pdf.pageOrientation("landscape");
		pdf.defaultStyle({
			fontSize: 6,
			bold: true
		});
		pdf.pageSize(pageSize);

		const schoolNameNode = new Txt(school.name)
			.fontSize(16)
			.bold()
			.alignment("center").end;
		const titleNode = new Txt(title)
			.fontSize(12)
			.color("#673ab7")
			.alignment("center").end;
		const schoolAddress = new Txt(school.address || "")
			.fontSize(11)
			.alignment("right").end;
		const schoolPhone = new Txt(school.phone || "")
			.fontSize(11)
			.alignment("right").end;
		const schoolEmail = new Txt(school.email || "")
			.fontSize(11)
			.alignment("right").end;

		let logoNode: any;
		try {
			logoNode = await new Img(`${logo}?cacheblock=true`)
				.fit([60, 60])
				.alignment("left")
				.build();
		} catch (error) {
			logoNode = await new Img("../../../../assets/img/sig_default.jpg")
				.fit([60, 60])
				.alignment("left")
				.build();
		}

		pdf.add(
			new Columns([
				[logoNode],
				[schoolNameNode, titleNode],
				[schoolAddress, schoolPhone, schoolEmail]
			]).columnGap(5).end
		);

		pdf.add(new Table([[], [], [], []]).end);

		// exam report table
		pdf.add(
			new Table(tables[0].table)
				.headerRows(2)
				.widths(tables[0].tableWidths ?? "auto")
				.layout({
					fillColor: function (i) {
						if (i === 0 || i === 1) {
							return "#eeeeff";
						}
						return "#fff";
					},
					hLineWidth: (i) => {
						// if (i === 0 || i === 1) {
						// 	return 0;
						// }
						return 1;
					},
					vLineWidth: function () {
						return 1;
					},
					hLineColor: function () {
						return "#000000";
					},
					vLineColor: function () {
						return "#000000";
					},
					paddingTop: function () {
						return 4;
					},
					paddingBottom: () => {
						return 4;
					}
				}).end
		);

		return pdf.create();
	}

	getStudentsByResidence(
		residenceId: number,
		intakeId?: number,
		streamId?: number
	): Observable<any> {
		const urlSearchParams: URLSearchParams = new URLSearchParams();
		residenceId ? urlSearchParams.set("residenceId", String(residenceId)) : "";
		intakeId ? urlSearchParams.append("intakeId", String(intakeId)) : "";
		streamId ? urlSearchParams.append("streamId", String(streamId)) : "";
		const url = `${environment.apiurl}/residence/students?${urlSearchParams}`;
		return this.http.get(url);
	}
}
