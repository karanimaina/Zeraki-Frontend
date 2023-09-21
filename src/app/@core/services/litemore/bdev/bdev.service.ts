import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import jsPDF from "jspdf";
import { BehaviorSubject, Observable } from "rxjs";
import { environment } from "src/environments/environment";
import * as Excel from "exceljs";
import { TranslateService } from "@ngx-translate/core";
import * as fs from "file-saver";
import { shareReplay, switchMapTo } from "rxjs/operators";
import { LitemoreSchoolProfile } from "src/app/@core/models/litemore/school/litemore-school-profile";
import { Region } from "src/app/@core/models/region/region";

@Injectable({
	providedIn: "root"
})
export class BdevService {
	apiUrl = environment.apiurl;

	private schoolInfo: BehaviorSubject<LitemoreSchoolProfile> =
		new BehaviorSubject<LitemoreSchoolProfile>(null!);
	private _regionsSubject$: BehaviorSubject<any> = new BehaviorSubject<any>(
		null!
	);

	constructor(private http: HttpClient, private translate: TranslateService) {}

	doGet(url: any): Observable<any> {
		return this.http.get(this.apiUrl + url);
	}
	doPostNoParams(url: any): Observable<any> {
		return this.http.post(this.apiUrl + url, null);
	}
	doPostWithParams(url: any, body: any): Observable<any> {
		return this.http.post(this.apiUrl + url, body);
	}
	doPutNoParams(url: any): Observable<any> {
		return this.http.put(this.apiUrl + url, null);
	}
	doPutWithParams(url: any, body: any): Observable<any> {
		return this.http.put(this.apiUrl + url, body);
	}
	doDelete(url: any): Observable<any> {
		return this.http.delete(this.apiUrl + url);
	}

	regions$: Observable<Region[]> = this._regionsSubject$.pipe(
		switchMapTo(this.getRegions()),
		shareReplay()
	);

	resetRegions() {
		this._regionsSubject$.next(null!);
	}

	getRegions(): Observable<Region[]> {
		return this.http.get<Region[]>(`${this.apiUrl}/region`);
	}

	getRelationManagers(region: any): Observable<any> {
		const url = `/region/relationshipManager?regionId=${region}`;
		return this.http.get(this.apiUrl + url);
	}

	getRegionCounties(region: any): Observable<any> {
		const url = `/invoice/county?regionId=${region}`;
		return this.http.get(this.apiUrl + url);
	}

	getSchoolProformas(params: any): Observable<any> {
		const url = `/invoice/schools${params}`;
		return this.http.get(this.apiUrl + url);
	}

	updateTrackingUsage(params: any): Observable<any> {
		const url = `/invoice/usageTracking${params}`;
		return this.http.put(this.apiUrl + url, {});
	}

	//School view apis
	loadSchoolInfo(school_id: any): Observable<any> {
		const url = `/invoice/details/school/${school_id}`;
		return this.http.get(this.apiUrl + url);
	}

	getInvoiceCollections(invoiceId: any): Observable<any> {
		const url = `/invoice/${invoiceId}/collection`;
		return this.http.get(this.apiUrl + url);
	}
	getInvoiceItems(invoiceId: any): Observable<any> {
		const url = `/invoice/${invoiceId}/item`;
		return this.http.get(this.apiUrl + url);
	}
	getSpecificSchoolProformas(schoolId: any, params: any): Observable<any> {
		const url_main = "/invoice/proforma/" + schoolId + params;
		return this.http.get(this.apiUrl + url_main);
	}

	generateInvoiceDocument(content: any, isProforma = true): Observable<any> {
		console.warn("generateInvoiceDocument() >> ", content);
		return new Observable((s) => {
			// if (document_content.item === "Zeraki Analytics setup and first year subscription") {
			// 	document_content.item = "Zeraki Analytics setup and first \nyear subscription";
			// }
			// if (document_content.item === "Zeraki Analytics subscription renewal") {
			// 	document_content.item = "Zeraki Analytics subscription \nrenewal";
			// }
			const textWidth = function (text, font) {
				// re-use canvas object for better performance
				const canvas: any = document.createElement("canvas");
				const ctx = canvas.getContext("2d");
				ctx.font = font; // This can be set programmaticly from the element's font-style if desired
				const textWidth = ctx.measureText(text).width;
				return Math.ceil(textWidth / 3.8);
			};

			const center = function (txt) {
				const length = textWidth(txt, "Helvetica 18 bold");
				const x = Math.round(((105 - length) / 2) * 100) / 100;
				return x;
			};
			//create the document name

			let invoicePrefix = "";
			let invoiceType = "";
			let documentNumber = "";
			if (!isProforma) {
				documentNumber = content.invoiceNumber;
				invoiceType = "INVOICE ";
				invoicePrefix = "INVOICE ";
			} else if (isProforma) {
				documentNumber = content.proformaNumber;
				invoiceType = "PROFORMA INVOICE ";
			}
			const invoiceName = content.schoolName + "_" + content.dueDate;

			const d = new jsPDF("p", "mm", "a4");
			// d.setFontSize('helvetica');

			//create the image
			const litemore_logo = new Image();
			// litemore_logo.src = "assets_new/images/landing_page/litemore_logo_cropped.png";
			litemore_logo.src = "../../../assets/img/litemore_logo_cropped.png";

			//add the image
			//aligned Logo
			//            d.addImage(this,105.73 ,30.34,79.6,45.2);
			//centered Logo
			d.addImage(litemore_logo, 114.5, 30.34, 79.6, 45.2);
			//            d.addImage(this,117.7 ,30.34,79.6,45.2);
			//
			//          Document Content
			//invoice title
			d.setFontSize(36);
			d.setFont("Helvetica", "bold");
			d.setTextColor("#003265");

			d.text(invoiceType, 20.4, 24.7);

			//ADDRESS SECTION
			//------------------------------
			//company name
			d.setFontSize(16);
			d.setFont("Helvetica", "bold");
			d.setTextColor("#000");
			d.text("Litemore Limited", 20.4, 40.34);

			//company p.o.box
			d.setFont("Helvetica", "normal");
			d.text("P.O. Box 51235-00100", 20.4, 48.98);

			//company address
			d.text("Nairobi, Kenya", 20.4, 57.62);

			//company phone
			const number: any = content.customer_care_number
				? content.customer_care_number
				: "254 790 493 495";
			d.text(number, 20.4, 66.26);

			//company email
			d.text("info@litemore.co.ke", 20.4, 74.9);

			//kra pin
			d.setFontSize(16);
			d.setFont("Helvetica", "bold");
			d.text("KRA PIN: P051523925C", 20.4, 85.54);

			//BILLING SECTION
			//------------------------------
			//invoice number(property + value)

			d.setFont("Helvetica", "bold");
			d.setTextColor("#003265");
			d.text(invoicePrefix + "#", 115.73, 109.7);

			d.setFont("Helvetica", "normal");
			d.setTextColor("#000");
			d.text(documentNumber, 194.6, 109.7, { align: "right" });

			//invoice Date
			d.setFont("Helvetica", "bold");
			d.setTextColor("#003265");
			d.text(invoicePrefix + "DATE", 115.73, 121.34);

			d.setFont("Helvetica", "normal");
			d.setTextColor("#000");
			d.text(content.creationDate, 194.6, 121.34, { align: "right" });

			//invoice Due Date
			d.setFont("Helvetica", "bold");
			d.setTextColor("#003265");
			d.text("DUE DATE", 115.73, 132.98);

			d.setFont("Helvetica", "normal");
			d.setTextColor("#000");
			d.text(content.dueDate, 194.6, 132.98, { align: "right" });

			//Bill To
			d.setFont("Helvetica", "bold");
			d.setTextColor("#003265");
			d.text("BILL TO", 20.4, 116.34);

			d.setFont("Helvetica", "normal");
			d.setTextColor("#000");
			//

			const max_length = 23;
			const sch_name = content.schoolName.toUpperCase();
			let array_sch_name_parts = [];
			let sch_nm = sch_name;
			if (sch_name.length > max_length) {
				array_sch_name_parts = sch_name.split(" ");
				sch_nm = "";
				let nm = "";
				for (let a = 0; a < array_sch_name_parts.length; a++) {
					const part = array_sch_name_parts[a];
					if ((nm + " " + part).length > max_length) {
						nm += "\n" + part + " ";
						sch_nm = sch_nm.length === 0 ? nm : sch_nm + nm;
						nm = "";
					} else {
						nm += part + " ";
					}
				}
				sch_nm += nm;
			}
			d.text(sch_nm, 20.4, 124.98);

			//TABLE DESCRIPTION SECTION
			//---------------------------------
			//top line
			d.setDrawColor("#62cb31");
			d.setLineWidth(1);
			d.line(20.4, 143.89, 194.6, 143.89);
			//cells
			d.setLineWidth(0);
			d.setDrawColor(0);
			d.setFillColor("#dff0d8");
			d.rect(20.4, 143.89, 174.2, 17, "F");

			d.setFontSize(14);
			d.setFont("Helvetica", "bold");
			d.setTextColor("#003265");
			d.text("DESCRIPTION", 24.4, 153.89);

			d.text("NET", 100.4, 150.89);
			d.text("VAT", 130.4, 150.89);
			d.text("GROSS", 169.4, 150.89);

			d.text("AMOUNT", 90.4, 157.89);
			d.text("(16%)", 130.4, 157.89);
			d.text("AMOUNT", 166.4, 157.89);
			d.setDrawColor("#62cb31");
			d.setLineWidth(1);
			d.setLineWidth(1);
			d.line(20.4, 160.89, 194.6, 160.89);

			//table content
			//todo - shoud be calculated in a loop!
			let rectangle_item_y = 160.89; //will increase with 20
			let text_item_y = 169.89; //will also increase with 20

			d.setLineWidth(0);
			d.setDrawColor(0);
			d.setFontSize(12);
			d.setFont("Helvetica", "normal");
			d.setTextColor("#000");
			const item = content.items;
			for (let a = 0; a < item.length; a++) {
				//check if content exceeds the page
				if (rectangle_item_y > 297 - 20.4) {
					d.addPage();
					rectangle_item_y = 20.4;
					text_item_y = 29.4;
				}

				//check if even or odd
				if (a % 2 === 0) {
					d.setFillColor("#f9f9f9");
				} else {
					d.setFillColor("#f3f3f3");
				}

				d.rect(20.4, rectangle_item_y, 174.2, 20, "F");
				const vat = (item[a].grossAmount - item[a].grossAmount / 1.16)
					.toFixed(2)
					.replace(/\d(?=(\d{3})+\.)/g, "$&,");
				const net = (item[a].grossAmount / 1.16)
					.toFixed(2)
					.replace(/\d(?=(\d{3})+\.)/g, "$&,");
				const gross = item[a].grossAmount
					.toFixed(2)
					.replace(/\d(?=(\d{3})+\.)/g, "$&,");

				if (
					item[a].item === "Zeraki Analytics setup and first year subscription"
				) {
					item[a].item = "Zeraki Analytics setup and first \nyear subscription";
				} else if (item[a].item === "Zeraki Analytics subscription renewal") {
					item[a].item = "Zeraki Analytics subscription \nrenewal";
				}
				d.text(item[a].item, 24.4, text_item_y);
				d.text(net, 93.4, text_item_y);
				d.text(vat, 130.4, text_item_y);
				d.text(gross, 169.4, text_item_y);

				rectangle_item_y += 20;
				text_item_y += 20;
			}

			//total amount
			d.setFontSize(18);
			d.setFont("Helvetica", "bold");
			d.setTextColor("#003265");
			let amount_y_position = rectangle_item_y + 19.65; //190.54

			d.text(
				"Total KSh " +
					content.grossAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,"),
				194.6,
				amount_y_position,
				{ align: "right" }
			);

			if (content?.collections?.length > 0) {
				amount_y_position += 20;
				//TABLE PAYMENTS SECTION
				//---------------------------------
				//top line
				d.setDrawColor("#62cb31");
				d.setLineWidth(1);
				d.line(20.4, amount_y_position, 194.6, amount_y_position); // 210.54
				//cells
				d.setLineWidth(0);
				d.setDrawColor(0);
				d.setFillColor("#dff0d8");
				d.rect(20.4, amount_y_position, 174.2, 11, "F");

				amount_y_position += 7;
				d.setFontSize(14);
				d.setFont("Helvetica", "bold");
				d.setTextColor("#003265");
				d.text("PAYMENT DATE", 24.4, amount_y_position); //217.54
				d.text("AMOUNT", 169.4, amount_y_position);
				d.setDrawColor("#62cb31");
				d.setLineWidth(0);
				amount_y_position += 3.96;
				d.line(20.4, amount_y_position, 194.6, amount_y_position); //221.5

				//Loop through the collection data array and append it here
				//monitor the y co-ordinate. if greater than 297-25.4, add new page, with a new margin top of 25.4
				//Due Amount should be last table cell y-co-ordinate + 29.65
				//things to check are as follow up on,
				//1.y-co-ordinate for the rectangle
				//2.height of the cell. always constant: 11
				//3.y-co-ordinate for the text
				//4. color of odd number to be f9f9f9
				//5. color of even number to be f3f3f3
				//Text y-co-ordinate increases by 11
				//Rectangle y-co-ordinateincreases by 11
				d.setFontSize(12);
				d.setFont("Helvetica", "normal");
				d.setTextColor("#000");

				const col = content.collections;
				let rectangle_y = amount_y_position;
				amount_y_position += 7.04;
				let text_y = amount_y_position; //228.54

				for (let a = 0; a < col.length; a++) {
					const collection_date = col[a].collectionDate;
					const collection_amount = col[a].amount
						.toFixed(2)
						.replace(/\d(?=(\d{3})+\.)/g, "$&,");

					//check if values exceed page
					if (text_y > 297 - 25.4) {
						d.addPage();
						d.setFontSize(12);
						d.setFont("Helvetica", "normal");
						d.setTextColor("#000");

						rectangle_y = 23.54;
						text_y = 30.54;

						//set fill color for odd and even number
						if (a % 2 === 0) {
							//even
							d.setFillColor("#f3f3f3");
						} else {
							//odd
							d.setFillColor("#f9f9f9");
						}
						//create the rectangle first
						d.setLineWidth(0);
						d.setDrawColor(0);
						d.rect(20.4, text_y - 7.04, 174.2, 11, "F");

						//set text
						d.text(collection_date, 24.4, text_y);
						d.text(collection_amount, 165.4, text_y);

						//increment the values
						text_y += 11;
					} else {
						//set fill color for odd and even number
						if (a % 2 === 0) {
							//even
							d.setFillColor("#f3f3f3");
						} else {
							//odd
							d.setFillColor("#f9f9f9");
						}
						//create the rectangle first
						d.setLineWidth(0);
						d.setDrawColor(0);
						d.rect(20.4, text_y - 7.04, 174.2, 11, "F");

						//set text
						d.text(collection_date, 24.4, text_y);
						d.text(collection_amount, 165.4, text_y);

						//increment the values
						text_y += 11;
						rectangle_y += 11;
					}
				}

				//Due Amount Content
				const _total_due_amount = content.amountRemaining
					.toFixed(2)
					.replace(/\d(?=(\d{3})+\.)/g, "$&,");
				//            var _total_due_amount = "100,000.00";
				const due_y_coordinate = text_y - 7.04 + 19.65;
				d.setFontSize(18);
				d.setFont("Helvetica", "bold");
				d.setTextColor("#ff562f");
				d.text("Balance KSh " + _total_due_amount, 194.6, due_y_coordinate, {
					align: "right"
				});
			}

			//save the document
			d.save(invoiceName + ".pdf", { returnPromise: true }).then(() => {
				s.next();
			});
		});
	}

	generateCollectionDocument(document_content: any): Observable<any> {
		return new Observable((s) => {
			{
				//create the document name
				const collection_name =
					document_content.schoolName +
					"_" +
					document_content.collectionId +
					"_receipt";

				const d = new jsPDF("p", "mm", "a4");
				// d.setFontSize('monospace',"normal");

				//create the image
				const litemore_logo = new Image();
				// litemore_logo.src = "assets_new/images/landing_page/litemore_logo_cropped.png";
				litemore_logo.src = "../../../assets/img/litemore_logo_cropped.png";
				//add the image
				d.addImage(litemore_logo, 114.5, 30.34, 79.6, 45.2);
				//
				//          Document Content
				//collection title
				d.setFontSize(36);
				d.setFont("Helvetica", "bold");
				d.setTextColor("#003265");
				d.text("RECEIPT", 20.4, 24.7);

				//ADDRESS SECTION
				//------------------------------
				//company name
				d.setFontSize(16);
				d.setFont("Helvetica", "bold");
				d.setTextColor("#000");
				d.text("Litemore Limited", 20.4, 40.34);

				//company p.o.box
				d.setFont("Helvetica", "normal");
				d.text("P.O. Box 51235-00100", 20.4, 48.98);

				//company address
				d.text("Nairobi, Kenya", 20.4, 57.62);

				//company phone
				d.text(document_content.customer_care_number, 20.4, 66.26);

				//company email
				d.text("info@litemore.co.ke", 20.4, 74.9);

				//kra pin
				d.setFontSize(16);
				d.setFont("Helvetica", "bold");
				d.text("KRA PIN: P051523925C", 20.4, 85.54);

				//BILLING SECTION
				//------------------------------
				//collection number(property + value)

				d.setFont("Helvetica", "bold");
				d.setTextColor("#003265");
				d.text("RECEIPT #:", 115.73, 109.7);

				d.setFont("Helvetica", "normal");
				d.setTextColor("#000");
				d.text(document_content.collectionId.toString(), 165.73, 109.7);

				//collection Date
				d.setFont("Helvetica", "bold");
				d.setTextColor("#003265");
				d.text("DATE:", 115.73, 121.34);

				d.setFont("Helvetica", "normal");
				d.setTextColor("#000");
				d.text(document_content.collectionDate, 165.73, 121.34);

				//Bill To
				d.setFont("Helvetica", "bold");
				d.setTextColor("#003265");
				d.text("RECEIPT TO", 20.4, 111.34);

				d.setFont("Helvetica", "normal");
				d.setTextColor("#000");
				d.text(document_content.schoolName, 20.4, 119.98);

				//TABLE DESCRIPTION SECTION
				//---------------------------------
				//top line

				d.line(20.4, 143.89, 194.6, 143.89);
				//cells
				d.setDrawColor("#5a5a5a");
				d.setLineWidth(0.1);
				d.setFillColor("#a8d08d");
				d.rect(20.4, 143.89, 120.65, 15, "FD");
				d.rect(141.05, 143.89, 53.55, 15, "FD");

				d.setFontSize(14);
				d.setFont("Helvetica", "bold");
				d.setTextColor("#000");
				d.text("BEING PAYMENT FOR", 24.4, 153.89);
				d.text("AMOUNT (KES)", 145.45, 153.89);

				//table content
				d.setFontSize(13);
				d.setFont("Helvetica", "normal");
				d.setTextColor("#000");
				//possibility for looping this section!
				d.rect(20.4, 158.89, 120.65, 11, "S");
				d.rect(141.05, 158.89, 53.55, 11, "S");
				d.text((document_content.itemType || ""), 24.4, 165.89);
				d.text(
					document_content.amount
						.toFixed(2)
						.replace(/\d(?=(\d{3})+\.)/g, "$&,"),
					145.45,
					165.89
				);

				d.setFontSize(14);
				d.setFont("Helvetica", "bold");
				d.setTextColor("#2f5496");
				d.rect(20.4, 169.89, 120.65, 11, "S");
				d.rect(141.05, 169.89, 53.55, 11, "S");
				d.text("Total", 24.4, 176.89);
				d.text(
					document_content.amount
						.toFixed(2)
						.replace(/\d(?=(\d{3})+\.)/g, "$&,"),
					145.45,
					176.89
				);

				//            d.rect(20.4, 180.89, 120.65, 11, 'S');
				//            d.rect(141.05, 180.89, 53.55, 11, 'S');
				//            d.text(24.4, 187.89, "Total");
				//            d.text(145.45, 187.89, document_content.amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,'));

				//save the document
				d.save(collection_name + ".pdf", { returnPromise: true }).then(() => {
					s.next();
				});

				//set the image url
			}
		});
	}

	getSchoolInfo() {
		return this.schoolInfo.asObservable();
	}

	setSchoolInfo(schoolId) {
		this.getSpecificSchoolDetails(schoolId).subscribe((schoolInfo) => {
			this.schoolInfo.next(schoolInfo);
		});
	}

	getSpecificSchoolDetails(school_id: any): Observable<any> {
		const url: any = `${this.apiUrl}/invoice/details/school/${school_id}`;
		return this.http.get(url);
	}

	getProformaInvoiceBalance(school_id: any, proforma_id: any): Observable<any> {
		const url_main =
			this.apiUrl +
			"/invoice/" +
			school_id +
			"/balance/proforma/" +
			proforma_id;
		return this.http.get(url_main);
	}
	getSchoolTypes(): Observable<any> {
		const url = "/groups/schooltypes";
		return this.http.get(this.apiUrl + url);
	}

	getGenderTypes(): Observable<any> {
		const url = "/groups/gendertypes";
		return this.http.get(this.apiUrl + url);
	}

	getInvoiceItemTypes(): Observable<any> {
		const url = "/groups/invoice/itemtypes";
		return this.http.get(this.apiUrl + url);
	}

	downloadReports(params: string, reportsType: string) {
		return this.http.get(
			`${environment.apiurl}/invoice/${reportsType}${params}`
		);
	}

	exportInvoiceReports(
		list: any,
		columnHeaders: Array<{ key: string }>,
		name: string
	) {
		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaders.map((item) => {
			const columnHeaderName: string = this.translate.instant(
				`workSheet.headers.${item.key}`
			);
			return columnHeaderName.toUpperCase();
		});

		//create the excel document.
		const workbook = new Excel.Workbook();
		const sheet = workbook.addWorksheet(name);
		const header: any[] = [...columns];

		const row: any[] = [];
		let nameWidth = 15;
		let itemsWidth = 15;

		// fill in the invoice data
		list.forEach((dataRow: any) => {
			if (dataRow["schoolName"]?.toString().length > nameWidth) {
				nameWidth = dataRow["schoolName"]?.toString().length + 2;
			}

			if (dataRow["invoiceItems"].length > itemsWidth) {
				itemsWidth = dataRow["invoiceItems"]?.length;
			}
			const schoolData = columnHeaders.map((header) => {
				return dataRow[`${header.key}`] || "";
			});
			row.push(schoolData);
		});

		// add Data
		sheet.addRow([name]);
		sheet.addRow(header);
		sheet.addRows(row);

		sheet.columns.forEach((column, idx) => {
			idx == 0
				? (column.width = nameWidth)
				: idx == 3
				? (column.width = itemsWidth)
				: (column.width = header[idx]?.toString().length + 5);
		});

		// formart first row
		sheet.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};
		sheet.getRow(1).alignment = { horizontal: "center" };
		sheet.getRow(2).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};
		sheet.mergeCells(`A1:${sheet.lastColumn.letter}1`);

		//save the excel
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
			});
			fs.saveAs(blob, `${name}_${new Date().getTime()}.xlsx`);
		});
	}

	exportCollectionReports(list: any, name: string) {
		const columnHeaderTranslations = [
			// the 'key' refers to translation keys in as in en.json
			{ key: "schoolName" },
			{ key: "invoiceNumber" },
			{ key: "items" },
			{ key: "amount" },
			{ key: "collectionDate" },
			{ key: "collectionBy" },
			{ key: "county" },
			{ key: "accountManager" },
			{ key: "accountOwner" },
			{ key: "additionalInfo" }
		];

		// generate translated excel columns
		const columns: Partial<Excel.Column>[] = columnHeaderTranslations.map(
			(item) => {
				const columnHeaderName: string = this.translate.instant(
					`workSheet.headers.${item.key}`
				);
				return columnHeaderName.toUpperCase();
			}
		);

		//create the excel document.
		const workbook = new Excel.Workbook();
		const sheet = workbook.addWorksheet(name);
		// console.warn("name >> ", name);
		const header: any[] = [...columns];

		const row: any[] = [];
		let nameWidth = 15;
		let itemsWidth = 15;

		// fill in the invoice data
		list.forEach((dataRow: any) => {
			if (dataRow.schoolName?.toString().length > nameWidth) {
				nameWidth = dataRow.schoolName?.toString().length + 2;
			}

			const items = dataRow.invoiceItems.map((item) => item.itemName);

			if (items?.toString().length > itemsWidth) {
				itemsWidth = items?.toString().length;
			}

			row.push([
				dataRow.schoolName,
				dataRow.invoiceNumber,
				items?.toString(),
				dataRow.amount,
				dataRow.collectionDate,
				dataRow.collectionBy,
				dataRow.county,
				dataRow.accountManager,
				dataRow.accountOwner,
				dataRow.additionalInfo
			]);
		});

		// add Data
		sheet.addRow([name]);
		sheet.addRow(header);
		sheet.addRows(row);

		sheet.columns.forEach((column, idx) => {
			idx == 0
				? (column.width = nameWidth)
				: idx == 2
				? (column.width = itemsWidth)
				: (column.width = header[idx]?.toString().length + 5);
		});

		// formart first row
		sheet.getRow(1).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};
		sheet.getRow(1).alignment = { horizontal: "center" };
		sheet.getRow(2).font = {
			name: "Calibri",
			color: { argb: "000000" },
			bold: true
		};
		sheet.mergeCells(`A1:${sheet.lastColumn.letter}1`);

		//save the excel
		workbook.xlsx.writeBuffer().then((data) => {
			const blob = new Blob([data], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8"
			});
			fs.saveAs(blob, `${name}_${new Date().getTime()}.xlsx`);
		});
	}
}
