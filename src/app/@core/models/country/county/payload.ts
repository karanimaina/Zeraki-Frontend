export interface RetrieveSubCountyFilters {
	currentPage?: number;
	countyId?: number;
	download?: boolean;
	name?: string;
}

export interface RetrieveRegionCountyFilters {
	currentPage?: number;
	countryId?: number;
	regionId?: number;
	download?: boolean;
	name?: string;
}

export interface AddRegionCountyPayload {
	name: string;
	code: number;
	regionId: number;
}

export interface UpdateRegionCountyPayload extends AddRegionCountyPayload {
	countyId: number;
}
