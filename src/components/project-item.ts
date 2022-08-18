import { Autobind } from "../decorators/autobind";
import { Component } from "./base-component";
import { Project } from "../models/project";
import { Draggable } from "../models/drag-drop";

export class ProjectItem
	extends Component<HTMLUListElement, HTMLLIElement>
	implements Draggable
{
	private project: Project;
	get persons() {
		if (this.project.numOfPeople === 1) {
			return "1 person";
		} else {
			return `${this.project.numOfPeople} persons `;
		}
	}
	constructor(hostId: string, project: Project) {
		super("single-project", hostId, false, project.id);
		this.project = project;
		this.renderContent();
		this.config();
	}
	@Autobind
	dragStartHandler(event: DragEvent) {
		event.dataTransfer!.setData("text/plain", this.project.id);
		event.dataTransfer!.effectAllowed = "move";
	}

	dragEndHandler(_: DragEvent) {
		console.log("dragEnd");
	}
	config() {
		this.element.addEventListener("dragstart", this.dragStartHandler);
		this.element.addEventListener("dragend", this.dragEndHandler);
	}
	renderContent() {
		this.element.querySelector("h2")!.textContent = this.project.title;
		this.element.querySelector("h3")!.textContent = this.persons + " assigned";
		this.element.querySelector("p")!.textContent = this.project.description;
	}
}
