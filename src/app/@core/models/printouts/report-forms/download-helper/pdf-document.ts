export class PdfDocument {
	public info = {
		title: ""
	};
	public content: any[] = [];
	private styles: any;
	private pageMargins: number[] = [];
	private defaultStyle: any;

	public setTitle(title: string) {
		this.info.title = title;
	}

	public setContent(content: any[]) {
		this.content = content;
	}

	public setStyles(styles: any) {
		this.styles = styles;
	}

	public setPageMargins(pageMargins: number[]) {
		this.pageMargins = pageMargins;
	}

	public setDefaultStyle(defaultStyle: any) {
		this.defaultStyle = defaultStyle;
	}
}
