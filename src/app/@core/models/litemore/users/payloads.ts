import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";

export interface RetrieveInternalViewsUsersFilters {
  currentPage?: number;
  regionId?: number;
  countyId?: number;
  countryId?: number;
  role?: LitemoreUserRole;
  name?: string;
	download?: boolean;
}

export interface AddInternalViewsUserPayload {
  phoneNumber: string;
  name: string;
  email: string;
  countyId?: number;
  litemoreRoles: LitemoreUserRole[];
}

export interface UpdateInternalViewsUserPayload extends AddInternalViewsUserPayload {
  userId: number;
}
