import { Columns, Img, PdfMakeWrapper, Txt } from "pdfmake-wrapper";
import { Invoice } from "./invoice";
import { LitemoreSchoolProfile } from "../school/litemore-school-profile";
import { CurrencyPipe, DatePipe } from "@angular/common";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
import { CountryService } from "src/app/@core/shared/services/country/country.service";
import { AppInjector } from "src/app/app.module";
import { CompanyInfo } from "./company/company-info";
import { TranslateService } from "@ngx-translate/core";

export class BaseInvoicePdf {
	protected readonly pdfDocument!: PdfMakeWrapper;
	protected invoice!: Invoice | any;
	protected schoolProfile!: LitemoreSchoolProfile | any;
	protected vatRate!: string;
	protected kraPin!: string;
	protected companyInfo?: CompanyInfo;
	protected isKenyanSchool = true;

	countryService = AppInjector.get(CountryService);
	translateService = AppInjector.get(TranslateService);

	protected currencyPipe;
	protected datePipe: DatePipe = new DatePipe("en-US");

	constructor(invoice: Invoice | any, schoolProfile: LitemoreSchoolProfile | any, kraPin: string, vatRate: string, companyInfo: CompanyInfo | undefined) {
		this.invoice = invoice;
		this.schoolProfile = schoolProfile;
		this.kraPin = kraPin;
		this.vatRate = vatRate;
		this.companyInfo = companyInfo;
		this.isKenyanSchool = this.companyInfo?.name?.toLocaleLowerCase().includes("zeraki")? false: true;

		this.currencyPipe = new CurrencyPipe("en-US", this.invoice?.currency? `${this.invoice?.currency} `: this.countryService.currentCountry?.currency? `${this.countryService.currentCountry?.currency} `: "KES ");

		PdfMakeWrapper.setFonts(pdfFonts);
		this.pdfDocument = new PdfMakeWrapper();
		this.pdfDocument.pageOrientation("portrait");
		this.pdfDocument.pageMargins([40, 40, 40, 40]);
		this.pdfDocument.defaultStyle({
			fontSize: 11,
			color: "#003265"
		});
	}

	protected async getCreditNoteContent(title: string) {
		const creditNoteTitle = new Txt(title).fontSize(28).color("#003265").bold().end;
		const companyName = new Txt(this.companyInfo?.name || "Litemore Limited").margin([0, 7, 0, 1]).bold().end;
		const companyAddress = new Txt(this.companyInfo?.address || "P.O. Box 51235-00100").margin([0, 4, 0, 2]).end;
		const companyPostalAddress = new Txt(this.companyInfo?.city || "Nairobi, Kenya 0798 666 000").margin([0, 2, 0, 2]).end;
		const companyPhone = new Txt(this.companyInfo?.phone || "0798 666 000").margin([0, 2, 0, 2]).end;
		const companyEmail = new Txt(this.companyInfo?.email || "info@litemore.co.ke").margin([0, 2, 0, 2]).end;
		const taxPayersPin = new Txt([
			new Txt(`${this.companyInfo?.pinTitle}: `).end,
			new Txt(this.kraPin).end
		]).bold().margin([0, 4, 0, 0]).end;

		const addressColumn = new Columns([
			[companyName, companyAddress, companyPostalAddress, companyPhone, companyEmail, taxPayersPin]
		]).width("60%").alignment("left").end;

		const companyLogo = await new Img(this.isKenyanSchool? "../../../../../assets/img/litemore_logo_cropped.png": "../../../../../assets/img/z_bg.png").fit([200, 200]).alignment("right").width("40%").build();

		return new Columns([
			[creditNoteTitle, addressColumn],
			companyLogo
		]).fontSize(14).color("#000000").end;
	}
}
