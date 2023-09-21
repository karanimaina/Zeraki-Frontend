export function computeCompetencyAreaResults(studentEvaluations, competencyAreas: Array<{ competencyAreaId: number, name: string }>) {
	return competencyAreas.map(c => {
		const competencyAreaEvaluations = evaluationResultsPerCompetency(studentEvaluations, c.competencyAreaId);
		let totalScore = 0;
		// Calculate total score of all evaluations per competency area
		competencyAreaEvaluations?.forEach(r => {
			totalScore += r.score;
		});
		// Average of all evaluations done per competency area
		let average = "";
		if (competencyAreaEvaluations && competencyAreaEvaluations.length > 1) {
			average = (Math.round((totalScore / competencyAreaEvaluations.length) * 100) / 100).toFixed(2);
		}

		return {
			competencyAreaId: c.competencyAreaId,
			name: c.name,
			evaluations: competencyAreaEvaluations,
			average: isNaN(parseInt(average)) ? "" : average
		};
	});
}


export function computeTopicResults(studentEvaluations, topics: Array<{ topicId: number; topicName: string }>, subjectId, subjects) {
	const topicResults = topics.map(topic => {
		let competencyAreas = subjects.find(s => s.subjectId == subjectId)?.competencyAreas;
		if (competencyAreas) {
			competencyAreas = competencyAreas.filter(c => c.topicId == topic.topicId);
		}
		let topicEvaluations = evaluationResultsPerTopic(studentEvaluations, topic.topicId);
		let totalScore = 0;
		// Calculate total score of all evaluations per competency area
		topicEvaluations?.forEach(e => {
			totalScore += e.score;
		});
		// Average of all evaluations done per competency area
		let average = "";
		if (topicEvaluations && topicEvaluations.length > 1) {
			average = (Math.round((totalScore / topicEvaluations.length) * 100) / 100).toFixed(2);
		}

		const competencyArea = computeCompetencyAreaResults(studentEvaluations, competencyAreas);
		topicEvaluations = topicEvaluations.filter(e => !e.competencyId);
		if (topicEvaluations && topicEvaluations.length > 0) {
			competencyArea.push({
				competencyAreaId: null!,
				name: topic.topicName,
				evaluations: topicEvaluations,
				average: ""
			});
		}

		return {
			topicId: topic.topicId,
			name: topic.topicName,
			average: isNaN(parseInt(average)) ? "" : average,
			competencyAreas: competencyArea,
			evaluations: topicEvaluations,
		};
	});

	return topicResults.filter(t => t.competencyAreas.length > 0);
}

function evaluationResultsPerCompetency(studentEvaluations, competencyAreaId: number) {
	const results = studentEvaluations?.map(e => e.results).flat();
	return results?.filter(r => r.competencyId===competencyAreaId);
}

function evaluationResultsPerTopic(studentEvaluations, topicId: number) {
	const results = studentEvaluations?.map(e => e.results).flat();
	return results?.filter(r => r.topicId===topicId);
}
