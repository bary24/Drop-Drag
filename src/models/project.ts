//Enum for project status//

export enum ProjectStatus {
	Active,
	Finished,
}
//Project Class

export class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public numOfPeople: number,
		public projectStatus: ProjectStatus
	) {}
}
