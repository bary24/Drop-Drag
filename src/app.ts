//An interface for the validatble input//
interface Validatable {
	value: string | number;
	required?: boolean;
	maxLength?: number;
	minLength?: number;
	max?: number;
	min?: number;
}

interface Draggable {
	dragStartHandler: (event: DragEvent) => void;
	dragEndHandler: (event: DragEvent) => void;
}

interface DragTarget {
	dragOverHandler: (event: DragEvent) => void;
	dropHandler: (event: DragEvent) => void;
	dragLeaveHandler: (event: DragEvent) => void;
}

//Validate function
function validate(validatableInput: Validatable) {
	let isValid = true;
	if (validatableInput.required) {
		isValid = isValid && validatableInput.value.toString().length !== 0;
	}
	if (validatableInput.maxLength != null && typeof validatableInput.value === "string") {
		isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
	}
	if (validatableInput.minLength != null && typeof validatableInput.value === "string") {
		isValid = isValid && validatableInput.value.length > validatableInput.minLength;
	}
	if (validatableInput.min != null && typeof validatableInput.value === "number") {
		isValid = isValid && +validatableInput.value > validatableInput.min;
	}
	if (validatableInput.max != null && typeof validatableInput.value === "number") {
		isValid = isValid && +validatableInput.value < validatableInput.max;
	}
	return isValid;
}

//Autobind Decorator
function Autobind(_: any, __: string, descriptor: PropertyDescriptor) {
	const originalMethod = descriptor.value;
	const adjDescriptor = {
		configurable: true,
		get() {
			const boundFn = originalMethod.bind(this);
			return boundFn;
		},
	};
	return adjDescriptor;
}

//Enum for project status//

enum ProjectStatus {
	Active,
	Finished,
}

//Custom type fpr listeners//

type Listener<T> = (projects: T[]) => void;

////////////////////////////////    Classes Section ////////////////////////////////

//Component base class//

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
	templateElement: HTMLTemplateElement;
	hostElement: T;
	element: U;

	constructor(
		templateId: string,
		hostElementId: string,
		insertAtStart: boolean,
		newElementId?: string
	) {
		this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
		this.hostElement = document.getElementById(hostElementId)! as T;

		const importedNode = document.importNode(this.templateElement.content, true);
		this.element = importedNode.firstElementChild! as U;
		if (newElementId) {
			this.element.id = newElementId;
		}
		this.attach(insertAtStart);
	}
	private attach(insertAtBeginning: boolean) {
		this.hostElement.insertAdjacentElement(
			insertAtBeginning ? "afterbegin" : "beforeend",
			this.element
		);
	}
	abstract config(): void;
	abstract renderContent(): void;
}

//Project Class

class Project {
	constructor(
		public id: string,
		public title: string,
		public description: string,
		public numOfPeople: number,
		public projectStatus: ProjectStatus
	) {}
}

//Project state base class //
class State<T> {
	protected listeners: Listener<T>[] = [];
	addListener(listenerFn: Listener<T>) {
		this.listeners.push(listenerFn);
	}
}

//Project state class

class ProjectState extends State<Project> {
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

const projectState = ProjectState.getInstance();

//Project input class
class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
	titleInputElement: HTMLInputElement;
	descriptionInputElement: HTMLInputElement;
	peopleInputElement: HTMLInputElement;
	constructor() {
		super("project-input", "app", true, "user-input");
		this.titleInputElement = this.element.querySelector("#title")! as HTMLInputElement;
		this.descriptionInputElement = this.element.querySelector(
			"#description"
		)! as HTMLInputElement;
		this.peopleInputElement = this.element.querySelector(
			"#people"
		)! as HTMLInputElement;
		this.config();
	}

	@Autobind
	private submitHandler(event: Event) {
		event.preventDefault();
		const userInput = this.gatherUserinput();
		if (Array.isArray(userInput)) {
			const [enteredTitle, enteredDesc, enteredPeople] = userInput;
			console.log(enteredTitle, enteredDesc, enteredPeople);
			projectState.addProject(...userInput);
		}

		this.clearInput();
	}
	public config() {
		this.element.addEventListener("submit", this.submitHandler);
	}

	public renderContent() {}
	private gatherUserinput(): [string, string, number] | void {
		const title = this.titleInputElement.value;
		const description = this.descriptionInputElement.value;
		const people = this.peopleInputElement.value;

		const finalTitle: Validatable = {
			value: title,
			required: true,
		};
		const finalDescription: Validatable = {
			value: description,
			maxLength: 20,
			minLength: 3,
		};
		const finalPeople: Validatable = {
			value: +people,
			max: 15,
			min: 0,
		};
		if (
			!validate(finalTitle) ||
			!validate(finalDescription) ||
			!validate(finalPeople)
		) {
			alert("Invalid input value");
			return;
		} else {
			console.log([title, description, +people]);

			return [title, description, +people];
		}
	}

	private clearInput() {
		this.titleInputElement.value = "";
		this.descriptionInputElement.value = "";
		this.peopleInputElement.value = "";
	}
}

///Project List Class////
class ProjectList
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

class ProjectItem
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

const firstInput = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
