import { PageInfo } from "../../common/pagination";

export interface CountyData {
	pageInfo: PageInfo;
	countryId: number;
	counties: County[];
}


export interface County {
  countyId: number;
  name: string;
  regionId: number;
  code: string;
  regionName: string;
}
