import { Project, ProjectStatus } from "../models/project";

//Custom type fpr listeners//

type Listener<T> = (projects: T[]) => void;

//Project state base class //
class State<T> {
	protected listeners: Listener<T>[] = [];
	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}
}

//Project state class

export class ProjectState extends State<Project> {
	private static instance: ProjectState;
	private projects: Project[] = [];

	private constructor() {
		super();
	}

	static getInstance() {
		if (this.instance) {
			return this.instance;
		}
		this.instance = new ProjectState();
		return this.instance;
	}
	addProject(title: string, description: string, numOfPeople: number) {
		const newProject = new Project(
			Math.floor(Math.random() * 100).toString(),
			title,
			description,
			numOfPeople,
			ProjectStatus.Active
		);
		console.log(newProject);

		this.projects.push(newProject);
		this.updateListeners();
	}
	moveProject(projectId: string, newStatus: ProjectStatus) {
		const project = this.projects.find((prj) => prj.id === projectId);
		if (project && project.projectStatus !== newStatus) {
			project.projectStatus = newStatus;
		}
		this.updateListeners();
	}
	private updateListeners() {
		for (const listener of this.listeners) {
			listener(this.projects.slice());
		}
	}
}

export const projectState = ProjectState.getInstance();
