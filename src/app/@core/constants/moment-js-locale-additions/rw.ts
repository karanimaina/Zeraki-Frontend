import * as moment from "moment";

const rw =  moment.defineLocale("rw", {
	months: "Mutarama_Gashyantare_Werurwe_Mata_Gicurasi_Kamena_Nyakanga_Kanama_Nzeri_Ukwakira_Ugushyingo_Ukuboza".split(
		"_"
	),
	monthsShort: "mut._gas._wer._mat._gic_kam._nya._kan._nze._ukw._ugu._uku.".split("_"),
	weekdays: "Ku cyumweru_Kuwa mbere_Kuwa kabiri_Kuwa gatatu_Kuwa kane_Kuwa gatanu_Kuwa gatandatu".split(
		"_"
	),
	weekdaysShort: "cyu._mbe._kab._gtu._kan._gnu._gnd.".split("_"),
	weekdaysMin: "cyu._mbe._kab._gtu._kan._gnu._gnd.".split("_"),
	longDateFormat: {
		LT: "HH:mm",
		LTS: "HH:mm:ss",
		L: "DD/MM/YYYY",
		LL: "D MMMM YYYY",
		LLL: "D MMMM YYYY HH:mm",
		LLLL: "dddd, D MMMM YYYY HH:mm",
	},
	calendar: {
		sameDay: "[Today at] LT",
		nextDay: "[Tomorrow at] LT",
		nextWeek: "dddd [at] LT",
		lastDay: "[Yesterday at] LT",
		lastWeek: "[Last] dddd [at] LT",
		sameElse: "L",
	},
	relativeTime: {
		future: "in %s",
		past: "%s ago",
		s: "a few seconds",
		ss: "%d seconds",
		m: "a minute",
		mm: "%d minutes",
		h: "an hour",
		hh: "%d hours",
		d: "a day",
		dd: "%d days",
		M: "a month",
		MM: "%d months",
		y: "a year",
		yy: "%d years",
	},
	dayOfMonthOrdinalParse: /\d{1,2}(st|nd|rd|th)/,
	ordinal: function (number) {
		const b = number % 10,
			output =
                ~~((number % 100) / 10) === 1
                	? "th"
                	: b === 1
                		? "st"
                		: b === 2
                			? "nd"
                			: b === 3
                				? "rd"
                				: "th";
		return number + output;
	},
	week: {
		dow: 1, // Monday is the first day of the week.
		doy: 4, // The week that contains Jan 4th is the first week of the year.
	},
});

export default rw;
