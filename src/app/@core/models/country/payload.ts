export interface AddCountryProfilePayload {
  name: string;
  currency: string;
  vatRate: number;
  countryCode: number;
  division: string;
}

export interface UpdateCountryProfilePayload extends AddCountryProfilePayload {
  countryId: number;
}
