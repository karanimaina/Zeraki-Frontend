export interface SubjectWithTopics{
  classLevel: number,
  subjectId: number,
  subjectName: string,
  topics: Array<SubjectTopic>
}

export interface SubjectTopic{
  topicId: number,
  topicName: string,
  numberOfCompetencies: number,
  competencies: Array<TopicCompetency>
}

export interface TopicCompetency{
  competencyAreaId: number,
  name: string,
  topicId: number
}
