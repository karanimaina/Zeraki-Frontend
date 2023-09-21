export interface StudentActivity{
  activityId: number;
  activityName: string;
  activities: Array<{
    id: number;
    createdBy: string;
    createdOn: string;
    description: string;
  }>
}
