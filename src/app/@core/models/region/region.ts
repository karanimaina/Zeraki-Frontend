import { PageInfo } from "../common/pagination";

export interface RegionsData {
	pageInfo: PageInfo;
	regions: Region[];
}

export interface Region {
    manager: string, // deprecated
    regionId: number,
    name: string

    countryId: number;
    countryName: string;
    customerCareNumber: string;
    regionalManagerId: number;
    regionalManagerName: string;
}
