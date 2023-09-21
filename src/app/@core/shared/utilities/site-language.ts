export type LanguageCode = "en" | "fr" | "sw" | "rw" | "am"; // TODO: add other language codes as appropriate

export interface Language {
  code: LanguageCode;
  label: string;
  flagCode: string;
}

export const languageList: Language[] = [
	{ code: "en", label: "English", flagCode: "GB" },
	{ code: "fr", label: "French", flagCode: "FR" },
	{ code: "sw", label: "Swahili", flagCode: "TZ" },
	{ code: "rw", label: "Rwandese", flagCode: "RW" },
	{ code: "am", label: "Amharic", flagCode: "ET" },
];
