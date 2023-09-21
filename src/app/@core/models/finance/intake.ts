export interface Intake {
  id: number;
  name: string;
  originalGradYear: number;
  graduationYear: number;
  graduationMonth: number;
  code: string;
  status?: string;
  supervisorId?: number;
}
  