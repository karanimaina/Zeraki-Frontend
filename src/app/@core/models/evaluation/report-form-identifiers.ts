export interface ReportFormIdentifiers{
  abbreviations: Array<{
    abbreviation: string;
    meaning: string;
  }>,
  identifiers: Array<{
    identifier: string;
    descriptor: string;
  }>
}
