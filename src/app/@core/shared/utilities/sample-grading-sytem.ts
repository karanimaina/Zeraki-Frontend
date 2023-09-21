import { GradingSystem } from "../../models/exams/grading-system";

export const sampleGradingSystem = (): Array<GradingSystem> => {
	return [
		{
			grade: "E",
			points: 1,
			high: 29,
			low: 0
		},
		{
			grade: "D-",
			points: 2,
			high: 34,
			low: 30
		},
		{
			grade: "D",
			points: 3,
			high: 39,
			low: 35
		},
		{
			grade: "D+",
			points: 4,
			high: 44,
			low: 40
		},
		{
			grade: "C-",
			points: 5,
			high: 49,
			low: 45
		},
		{
			grade: "C",
			points: 6,
			high: 54,
			low: 50
		},
		{
			grade: "C+",
			points: 7,
			high: 59,
			low: 55
		},
		{
			grade: "B-",
			points: 8,
			high: 64,
			low: 60
		},
		{
			grade: "B",
			points: 9,
			high: 69,
			low: 65
		},
		{
			grade: "B+",
			points: 10,
			high: 74,
			low: 70
		},
		{
			grade: "A-",
			points: 11,
			high: 79,
			low: 75
		},
		{
			grade: "A",
			points: 12,
			high: 100,
			low: 80
		},
	];
};

export const sampleIGCSEGradingSystem = (): Array<GradingSystem> => {
	return [
		{
			grade: "U",
			points: 0,
			high: 9,
			low: 0
		},
		{
			grade: "G",
			points: 1,
			high: 19,
			low: 10
		},
		{
			grade: "F",
			points: 2,
			high: 29,
			low: 20
		},
		{
			grade: "E",
			points: 3,
			high: 39,
			low: 30
		},
		{
			grade: "D",
			points: 4,
			high: 49,
			low: 40
		},
		{
			grade: "C",
			points: 5,
			high: 59,
			low: 50
		},
		{
			grade: "B",
			points: 6,
			high: 79,
			low: 60
		},
		{
			grade: "A",
			points: 7,
			high: 89,
			low: 80
		},
		{
			grade: "A*",
			points: 8,
			high: 100,
			low: 90
		}
	];
};

export const sampleTzPrimaryGradingSystem = (): Array<GradingSystem> => {
	return [
		{
			grade: "F",
			points: 1,
			comment: "Very Weak",
			high: 20,
			low: 0,
		},
		{
			grade: "D",
			points: 2,
			comment: "Weak",
			high: 40,
			low: 21,
		},
		{
			grade: "C",
			points: 3,
			comment: "Average",
			high: 60,
			low: 41,
		},
		{
			grade: "B",
			points: 4,
			comment: "Very Good",
			high: 80,
			low: 61,
		},
		{
			grade: "A",
			points: 5,
			comment: "Excellent",
			high: 100,
			low: 81,
		},
	];
};

export const sampleTzOlevelGradingSystem = (): Array<GradingSystem> => {
	return [
		{
			grade: "F",
			points: 5,
			comment: "Fail",
			high: 29,
			low: 0,
		},
		{
			grade: "D",
			points: 4,
			comment: "Satisfactory",
			high: 44,
			low: 30,
		},
		{
			grade: "C",
			points: 3,
			comment: "Good",
			high: 64,
			low: 45,
		},
		{
			grade: "B",
			points: 2,
			comment: "Very Good",
			high: 74,
			low: 65,
		},
		{
			grade: "A",
			points: 1,
			comment: "Excellent",
			high: 100,
			low: 75,
		},
	];
};

export const sampleTzAlevelGradingSystem = (): Array<GradingSystem> => {
	return [
		{
			grade: "F",
			points: 7,
			comment: "Fail",
			high: 34,
			low: 0,
		},
		{
			grade: "S",
			points: 6,
			comment: "Subsidiary",
			high: 39,
			low: 35,
		},
		{
			grade: "E",
			points: 5,
			comment: "Satisfactory",
			high: 49,
			low: 40,
		},
		{
			grade: "D",
			points: 4,
			comment: "Average",
			high: 59,
			low: 50,
		},
		{
			grade: "C",
			points: 3,
			comment: "Good",
			high: 69,
			low: 60,
		},
		{
			grade: "B",
			points: 2,
			comment: "Very Good",
			high: 79,
			low: 70,
		},
		{
			grade: "A",
			points: 1,
			comment: "Excellent",
			high: 100,
			low: 80,
		},
	];
};

export const sampleZimbabweDefaultGradingSystem = (): Array<GradingSystem> => {
	return [
		{
			grade: "U",
			points: 0,
			high: 19,
			gpa: 0.0,
			low: 0
		},
		{
			grade: "G",
			points: 1,
			high: 29,
			gpa: 1.0,
			low: 20
		},
		{
			grade: "F",
			points: 2,
			high: 39,
			gpa: 1.3,
			low: 30
		},
		{
			grade: "E",
			points: 3,
			high: 49,
			gpa: 2.0,
			low: 40
		},
		{
			grade: "D",
			points: 4,
			high: 59,
			gpa: 2.3,
			low: 50
		},
		{
			grade: "C",
			points: 5,
			high: 69,
			gpa: 3.0,
			low: 60
		},
		{
			grade: "B",
			points: 6,
			high: 79,
			gpa: 3.7,
			low: 70
		},
		{
			grade: "A",
			points: 7,
			high: 89,
			gpa: 4.0,
			low: 80
		},
		{
			grade: "A*",
			points: 8,
			high: 100,
			gpa: 4.0,
			low: 90
		},
	];
};

export const sampleZimbabwePrimaryGradingSystem = (): Array<GradingSystem> => {
	return [
		{
			grade: "U",
			points: 8,
			high: 19,
			gpa: 0.0,
			low: 0
		},
		{
			grade: "G",
			points: 7,
			high: 29,
			gpa: 1.0,
			low: 20
		},
		{
			grade: "F",
			points: 6,
			high: 39,
			gpa: 1.3,
			low: 30
		},
		{
			grade: "E",
			points: 5,
			high: 49,
			gpa: 2.0,
			low: 40
		},
		{
			grade: "D",
			points: 4,
			high: 59,
			gpa: 2.3,
			low: 50
		},
		{
			grade: "C",
			points: 3,
			high: 69,
			gpa: 3.0,
			low: 60
		},
		{
			grade: "B",
			points: 2,
			high: 79,
			gpa: 3.7,
			low: 70
		},
		{
			grade: "A",
			points: 1,
			high: 89,
			gpa: 4.0,
			low: 80
		},
		{

			grade: "A*",
			points: 0,
			high: 100,
			gpa: 4.0,
			low: 90
		},
	];
};
