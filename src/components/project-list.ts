import { Autobind } from "../decorators/autobind.js";
import { Component } from "./base-component.js";
import { Project, ProjectStatus } from "../models/project.js";
import { DragTarget } from "../models/drag-drop.js";
import { projectState } from "../state/project-state.js";
import { ProjectItem } from "./project-item.js";

///Project List Class////
export class ProjectList
	extends Component<HTMLDivElement, HTMLUListElement>
	implements DragTarget
{
	assignedProjects: Project[];

	constructor(private type: "finished" | "active") {
		super("project-list", "app", false, `${type}-projects`);
		this.assignedProjects = [];

		this.config();
		this.renderContent();
	}
	@Autobind
	dragOverHandler(event: DragEvent) {
		if (event.dataTransfer && event.dataTransfer.types[0] === "text/plain") {
			event.preventDefault();
			const listEl = this.element.querySelector("ul")!;
			listEl.classList.add("droppable");
		}
	}
	@Autobind
	dropHandler(event: DragEvent) {
		const projId = event.dataTransfer!.getData("text/plain");
		projectState.moveProject(
			projId,
			this.type === "active" ? ProjectStatus.Active : ProjectStatus.Finished
		);
	}
	@Autobind
	dragLeaveHandler(_: DragEvent) {
		const listEl = this.element.querySelector("ul")!;
		listEl.classList.remove("droppable");
	}
	public renderContent() {
		const listId = `${this.type}-projects-list`;
		this.element.querySelector("ul")!.id = listId;
		this.element.querySelector(
			"h2"
		)!.textContent = `${this.type.toUpperCase()} PROJECTS`;
	}
	public config() {
		this.element.addEventListener("dragover", this.dragOverHandler);
		this.element.addEventListener("dragleave", this.dragLeaveHandler);
		this.element.addEventListener("drop", this.dropHandler);

		projectState.addListener((projects: Project[]) => {
			const relevantProjects = projects.filter((project) => {
				if (this.type === "active") {
					return project.projectStatus === ProjectStatus.Active;
				}
				return project.projectStatus === ProjectStatus.Finished;
			});
			this.assignedProjects = relevantProjects;
			this.renderProjects();
		});
	}

	private renderProjects() {
		const listEl = this.element.querySelector("ul")! as HTMLUListElement;

		listEl.innerHTML = "";

		for (const projItem of this.assignedProjects) {
			new ProjectItem(listEl.id, projItem);
		}
	}
}
