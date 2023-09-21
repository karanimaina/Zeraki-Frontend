export interface StudentNote {
  noteId: number;
  note: string;
  title: string;
  term: number;
  createdOn: number;
  category: string;
  recordedBy: string;
  year: number;
}

export interface StudentOldNote {
  category: { categoryid: number; name: string };
  date: string;
  from: { userid: number; name: string };
  messageRead: boolean;
  messageid: number;
  status: number;
  text: string;
  title: string;
}
