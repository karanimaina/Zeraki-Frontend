import { Directive, Input, TemplateRef, ViewContainerRef } from "@angular/core";
import { DataService } from "../../services/data/data.service";
import { SchoolTypes } from "../../../enums/school-types";
import { SchoolTypeData } from "../../../models/school-type-data";

@Directive({
	selector: "[appSchoolAccess]"
})
export class SchoolAccessDirective {
	@Input() hideComponent = false;
	private schoolTypeData!: SchoolTypeData;
	private schoolTypes: SchoolTypes[] = [];

	constructor(
		private templateRef: TemplateRef<any>,
		private viewContainerRef: ViewContainerRef,
		private dataService: DataService) { }

	@Input()
	set appSchoolAccess(schoolTypes: SchoolTypes[]) {
		this.schoolTypes = schoolTypes;
		this.dataService.schoolData.subscribe((schoolData) => {
			this.schoolTypeData = schoolData;
			this.decideVisibility();
		});
	}

	@Input()
	set appSchoolAccessHideComponent(hideComponent: boolean) {
		this.hideComponent = hideComponent;
		this.decideVisibility();
	}

	private decideVisibility() {
		this.viewContainerRef.clear();
		if ((!this.hideComponent &&
			this.schoolTypes.some(school=> this.schoolType?.includes(school)) ||
			(this.hideComponent && !this.schoolTypes.some(school => this.schoolType?.includes(school))))) {
			this.showComponent();
		}
	}

	showComponent() {
		this.viewContainerRef.createEmbeddedView(this.templateRef);
	}

	private get schoolType(): Array<SchoolTypes> | null {
		if (this.schoolTypeData?.isKcpePrimarySchool) {
			return [SchoolTypes.KCPE_PRIMARY_SCHOOL];
		} else if (this.schoolTypeData?.isKcseSchool) {
			return [SchoolTypes.KCSE_SCHOOL];
		} else if (this.schoolTypeData?.isOLevelSchool) {
			return [SchoolTypes.OLEVEL_SCHOOL];
		} else if (this.schoolTypeData?.isGuineaSchool) {
			if (this.schoolTypeData.isGuineaPrimarySchool) {
				return [SchoolTypes.GUINEA_PRIMARY, SchoolTypes.GUINEA_SCHOOL];
			} else if (this.schoolTypeData.isGuineaSecondarySchool) {
				return [SchoolTypes.GUINEA_SECONDARY, SchoolTypes.GUINEA_SCHOOL];
			} else {
				return [SchoolTypes.GUINEA_SCHOOL];
			}
		} else if (this.schoolTypeData?.isIgcse) {
			return [SchoolTypes.IGCSE_SCHOOL];
		} else if (this.schoolTypeData?.isTanzaniaPrimary) {
			return [SchoolTypes.TANZANIA_PRIMARY];
		} else if (this.schoolTypeData?.isTanzaniaSecondary) {
			return [SchoolTypes.TANZANIA_SECONDARY];
		} else if (this.schoolTypeData?.isIvorianSecondarySchool) {
			return [SchoolTypes.IVORY_COAST_SECONDARY];
		}  else if (this.schoolTypeData?.isIvorianPrimarySchool) {
			return [SchoolTypes.IVORY_COAST_PRIMARY];
		} else if (this.schoolTypeData?.isZimbabwePrimarySchool) {
			return [SchoolTypes.ZIMBABWE_PRIMARY];
		} else if (this.schoolTypeData?.isZimbabweSecondarySchool) {
			return [SchoolTypes.ZIMBABWE_SECONDARY];
		} else if (this.schoolTypeData?.isZimbabweIgcse) {
			return [SchoolTypes.ZIMBABWE_IGCSE];
		} else if (this.schoolTypeData?.isSouthAfricaPrimarySchool) {
			return [SchoolTypes.SOUTH_AFRICA_PRIMARY];
		} else if (this.schoolTypeData?.isSouthAfricaSecondarySchool) {
			return [SchoolTypes.SOUTH_AFRICA_SECONDARY];
		} else if (this.schoolTypeData?.isZambiaPrimarySchool) {
			return [SchoolTypes.ZAMBIA_PRIMARY];
		} else if (this.schoolTypeData?.isZambiaSecondarySchool) {
			return [SchoolTypes.ZAMBIA_SECONDARY];
		} else if (this.schoolTypeData?.isGhanaPrimarySchool) {
			return [SchoolTypes.GHANA_PRIMARY];
		} else if (this.schoolTypeData?.isGhanaPrimaryJuniorSchool) {
			return [SchoolTypes.GHANA_PRIMARY_JUNIOR];
		} else if (this.schoolTypeData?.isGhanaJuniorSchool) {
			return [SchoolTypes.GHANA_JUNIOR];
		} else if (this.schoolTypeData?.isGhanaSeniorSchool) {
			return [SchoolTypes.GHANA_SENIOR];
		} else {
			return null;
		}
	}

}
