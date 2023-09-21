import { SchoolValidityStatus } from "src/app/@core/enums/litemore/school-validity-status";
import { SchoolDataItemAction } from "../school/school-data-action";
import { DefaultSchool } from "./default-school";

export class InvalidSchool extends DefaultSchool {
	actions(): SchoolDataItemAction {
		return {
			enabled: true,
			items: [
				{
					text: "Validate",
					schoolType: "Valid",
					validityStatus: SchoolValidityStatus.Validate,
					roles: []
				},
				{
					text: "Make Joint School",
					schoolType: "Joint",
					validityStatus: SchoolValidityStatus.MakeJointSchool,
					roles: []
				},
				{
					text: "Make Demo School",
					schoolType: "Demo",
					validityStatus: SchoolValidityStatus.MakeDemoSchool,
					roles: []
				},
				{
					text: "Make Finance School",
					validityStatus: SchoolValidityStatus.MakeFinanceSchool,
					schoolType: "Finance",
					roles: []
				}
			]
		};
	}
}
