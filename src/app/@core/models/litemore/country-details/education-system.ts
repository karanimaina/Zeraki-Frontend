export interface CountryEducationSystem {
  countryId: number;
  educationSystems: CountryEducationSystemItem[];
}

export interface CountryEducationSystemItem {
  educationSystemId: number;
  name: string;
  code: string;
  classType: string;
  maxClassNumber: number;
}

