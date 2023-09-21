import { County } from "../../country/county/county";
import { CountryEducationSystem } from "./education-system";

export interface CountryDetails {
  countryId: number;
  countryCounties: CountryCounty;
  countryEducationSystems: CountryEducationSystem;
  currency: string;
}

interface CountryCounty {
  countryId: number;
  counties: County[];
}


