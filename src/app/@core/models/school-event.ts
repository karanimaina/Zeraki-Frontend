export class SchoolEvent {
	schoolEventId?: number;
	title = "";
	description = "";
	sessions: Array<EventSession> = [];
	eventDate?: any;
	startDate?: any;
	endDate?: any;
	createdOn?: any;
}

export class EventSession {
	schoolEventSessionId?: number;
	venue = "";
	startTime: any;
	endTime: any;
	participant: any;
	description!: string;
	participantDescription: any;
}