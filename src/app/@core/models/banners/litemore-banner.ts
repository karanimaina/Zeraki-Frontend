import { Banner } from "./banner";

export interface LitemoreBanner extends Banner {
	startDate: number;
	endDate: number;
	targetUsers: Array<string>;
	showInCountries: Array<{countryId: number; name: string}>
	bannerStatus: string;
	bannerId: number;
}
