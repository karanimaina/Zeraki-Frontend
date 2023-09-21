import { SchoolValidityStatus } from "src/app/@core/enums/litemore/school-validity-status";

export interface SchoolDataItemAction {
  enabled: boolean;
  isUnverified?: boolean;
  items: SchoolDataItemActionItems[];
}

interface SchoolDataItemActionItems {
  text: ActionText;
  schoolType?: string;
  validityStatus?: SchoolValidityStatus;
  roles: [];
}

export type ActionText = "Verify" | "Reject" | "Make Finance School" | "Make Demo School" | "Make Joint School" | "Invalidate" | "Validate"
