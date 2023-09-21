import { SchoolDataItemAction } from "../school/school-data-action";
import { DefaultSchool } from "./default-school";

export class UnverifiedSchool extends DefaultSchool {

	actions(): SchoolDataItemAction {
		return {
			enabled: true,
			isUnverified: true,
			items: [
				{
					text: "Verify",
					roles: [],
				},
				{
					text: "Reject",
					roles: [],
				},
			]
		};
	}
}
