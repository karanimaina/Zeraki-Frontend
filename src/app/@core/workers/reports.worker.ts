// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfMake = require("../../../../node_modules/pdfmake/build/pdfmake.min.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfFonts = require("../../../../node_modules/pdfmake/build/vfs_fonts.js");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfFontsOpenSans = require("../../../assets/pdf/fonts/pdf-make-opensans.js");

(pdfMake as any).vfs = {
	...pdfFonts.pdfMake.vfs,
	...pdfFontsOpenSans.pdfMake.vfs,
};
pdfMake.fonts = {
	OpenSans: {
		normal: "OpenSans-Regular.ttf",
		bold: "OpenSans-Bold.ttf",
		italics: "OpenSans-Italic.ttf",
		bolditalics: "OpenSans-BoldItalic.ttf"
	},
	Roboto: {
		normal: "Roboto-Regular.ttf",
		bold: "Roboto-Medium.ttf",
		italics: "Roboto-Italic.ttf",
		bolditalics: "Roboto-MediumItalic.ttf"
	}
};

addEventListener("message", ({ data }) => {
	const docDefinition = JSON.parse(data);
	new Promise(function (resolve, reject) {
		generatePdfBlob(docDefinition, function (result) {
			if (result) {
				resolve(result);
			} else {
				reject();
			}
		});
	}).then(function (pdfBlob) {
		postMessage({ pdfBlob });
	});
});

function generatePdfBlob(docDefinition, callback) {
	if (!callback) {
		throw new Error("generatePdfBlob is an async method and needs a callback");
	}

	pdfMake.createPdf(docDefinition).getBlob(callback);
}
