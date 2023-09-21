export interface RetrieveRegionsFilters {
  currentPage?: number;
	countryId?: number;
	download?: boolean;
	name?: string;
}

export interface AddRegionPayload {
  name: string;
  customerCareNumber: string;
  countryId: number;
  regionalManagerId?: number;
}

export interface UpdateRegionPayload extends AddRegionPayload {
  regionId: number;
}
