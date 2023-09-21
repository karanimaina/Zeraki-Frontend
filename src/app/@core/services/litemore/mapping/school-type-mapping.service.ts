import { Injectable } from "@angular/core";
import {
	AnalyticsSchool,
	JointSchool,
	DemoSchool,
	InvalidSchool,
	UnverifiedSchool,
	DefaultSchool
} from "src/app/@core/models/litemore/school-types";
import { LitemoreSchoolData } from "src/app/@core/models/litemore/school/litemore-school-data";
import { SchoolDataItem } from "src/app/@core/models/litemore/school/school-data";

@Injectable({
	providedIn: "root"
})

export class SchoolTypeMappingService {
	mapSchoolTypes(
		schoolsData: LitemoreSchoolData,
		schoolTypeName?: string | null
	): SchoolDataItem[] {
		const validSchoolsType =
			schoolTypeName === "Valid" ||
			schoolTypeName === "Analytics" ||
			schoolTypeName === "Finance" ||
			schoolTypeName === "Timetable";

		const schools: SchoolDataItem[] = schoolsData?.schools.map(
			({
				schoolId,
				name,
				registrationCode,
				county,
				subCountyName,
				subscriptionEndDate,
				registrationDate,
				senderId,
				smsCreditsBalance,
				zerakiPartner,
				accountManager,
				accountOwner,
				index,
				educationSystem,
				contactPersonName,
				contactPersonPhone,
				schoolOwnershipType,
				schoolRegionalLevel,
				teachers,
				students,
				femaleTeacherCount,
				maleTeacherCount,
				boysStudentCount,
				girlsStudentCount
			}) => {
				if (validSchoolsType) {
					return new AnalyticsSchool(
						schoolId,
						name,
						registrationCode,
						county!,
						subCountyName!,
						subscriptionEndDate!,
						registrationDate!,
						senderId!,
						smsCreditsBalance!,
						zerakiPartner!,
						accountManager!,
						accountOwner!,
						index!,
						educationSystem!,
						schoolRegionalLevel!,
						schoolOwnershipType!,
						contactPersonName!,
						contactPersonPhone!,
						teachers!,
						students!,
						femaleTeacherCount!,
						maleTeacherCount!,
						boysStudentCount!,
						girlsStudentCount!,
					);
				} else if (schoolTypeName === "Joint Exam") {
					return new JointSchool(
						schoolId,
						name,
						registrationCode,
						county!,
						subCountyName!,
						subscriptionEndDate!,
						registrationDate!,
						senderId!,
						smsCreditsBalance!,
						zerakiPartner!,
						accountManager!,
						accountOwner!,
						index!,
						educationSystem!,
						schoolRegionalLevel!,
						schoolOwnershipType!,
						contactPersonName!,
						contactPersonPhone!,
						teachers!,
						students!,
						femaleTeacherCount!,
						maleTeacherCount!,
						boysStudentCount!,
						girlsStudentCount!,
					);
				} else if (schoolTypeName === "Demo") {
					return new DemoSchool(
						schoolId,
						name,
						registrationCode,
						county!,
						subCountyName!,
						subscriptionEndDate!,
						registrationDate!,
						senderId!,
						smsCreditsBalance!,
						zerakiPartner!,
						accountManager!,
						accountOwner!,
						index!,
						educationSystem!,
						schoolRegionalLevel!,
						schoolOwnershipType!,
						contactPersonName!,
						contactPersonPhone!,
						teachers!,
						students!,
						femaleTeacherCount!,
						maleTeacherCount!,
						boysStudentCount!,
						girlsStudentCount!,
					);
				} else if (schoolTypeName === "Invalid") {
					return new InvalidSchool(
						schoolId,
						name,
						registrationCode,
						county!,
						subCountyName!,
						subscriptionEndDate!,
						registrationDate!,
						senderId!,
						smsCreditsBalance!,
						zerakiPartner!,
						accountManager!,
						accountOwner!,
						index!,
						educationSystem!,
						schoolRegionalLevel!,
						schoolOwnershipType!,
						contactPersonName!,
						contactPersonPhone!,
						teachers!,
						students!,
						femaleTeacherCount!,
						maleTeacherCount!,
						boysStudentCount!,
						girlsStudentCount!,
					);
				} else if (schoolTypeName === "Unverified") {
					return new UnverifiedSchool(
						schoolId,
						name,
						registrationCode,
						county!,
						subCountyName!,
						subscriptionEndDate!,
						registrationDate!,
						senderId!,
						smsCreditsBalance!,
						zerakiPartner!,
						accountManager!,
						accountOwner!,
						index!,
						educationSystem!,
						schoolRegionalLevel!,
						schoolOwnershipType!,
						contactPersonName!,
						contactPersonPhone!,
						teachers!,
						students!,
						femaleTeacherCount!,
						maleTeacherCount!,
						boysStudentCount!,
						girlsStudentCount!,
					);
				}

				return new DefaultSchool(
					schoolId,
					name,
					registrationCode,
					county!,
					subCountyName!,
					subscriptionEndDate!,
					registrationDate!,
					senderId!,
					smsCreditsBalance!,
					zerakiPartner!,
					accountManager!,
					accountOwner!,
					index!,
					educationSystem!,
					schoolRegionalLevel!,
					schoolOwnershipType!,
					contactPersonName!,
					contactPersonPhone!,
					teachers!,
					students!,
					femaleTeacherCount!,
					maleTeacherCount!,
					boysStudentCount!,
					girlsStudentCount!,
				);
			}
		);

		return schools;
	}
}
