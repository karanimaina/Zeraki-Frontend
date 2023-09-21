import { LitemoreUserRole } from "src/app/@core/enums/litemore-user-role";
import { PageInfo } from "../../common/pagination";

export interface LitemoreUsersData {
	pageInfo: PageInfo;
	countryId: number;
	profiles: InternalViewsUser[];
}

export interface InternalViewsUser {
  userId: number;
  phoneNumber: string;
  name: string;
  email: string;
  countyId?: number;
  countyName?: string;
  countryName?: string;
  regionName?: string;
  litemoreRoles?: LitemoreUserRole[];
  imageUrl?: string;
}
