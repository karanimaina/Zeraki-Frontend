import * as moment from "moment";

const am =  moment.defineLocale("am", {
	months: "ጃንዩወሪ_ፌብሩወሪ_ማርች_ኤፕሪል_ሜይ_ጁን_ጁላይ_ኦገስት_ሴፕቴምበር_ኦክቶበር_ኖቬምበር_ዲሴምበር".split(
		"_"
	),
	monthsShort: "ጃንዩ_ፌብሩ_ማርች_ኤፕሪ_ሜይ_ጁን_ጁላይ_ኦገስ_ሴፕቴ_ኦክቶ_ኖቬም_ዲሴም".split("_"),
	weekdays: "እሑድ_ሰኞ_ማክሰኞ_ረቡዕ_ሐሙስ_ዓርብ_ቅዳሜ".split(
		"_"
	),
	weekdaysShort: "እሑድ_ሰኞ_ማክሰኞ_ረቡዕ_ሐሙስ_ዓርብ_ቅዳሜ".split("_"),
	weekdaysMin: "እ_ሰ_ማ_ረ_ሐ_ዓ_ቅ".split("_"),
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

export default am;
