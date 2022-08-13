//an interface for the validatble input//
interface Validatable {
  value: string | number;
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  max?: number;
  min?: number;
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
type Listener = (projects: Project[]) => void;
/////////////////////////////////////////////    Classes //////////////////////////////////////

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
//Project state class

class ProjectState {
  private static instance: ProjectState;
  private projects: Project[] = [];
  private listeners: Listener[] = [];

  private constructor() {}
  addListener(listenerFn: Listener) {
    this.listeners.push(listenerFn);
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
    this.projects.push(newProject);
    for (const listener of this.listeners) {
      listener(this.projects.slice());
    }
  }
}

const projectState = ProjectState.getInstance();

//Project input class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;
  constructor() {
    this.templateElement = document.getElementById("project-input")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild! as HTMLFormElement;
    this.element.id = "user-input";
    this.titleInputElement = this.element.querySelector("#title")! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector("#description")! as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector("#people")! as HTMLInputElement;
    this.config();
    this.attach();
  }
  private attach() {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
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
  private config() {
    this.element.addEventListener("submit", this.submitHandler);
  }
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
      min: 5,
    };
    if (!validate(finalTitle) || !validate(finalDescription) || !validate(finalPeople)) {
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
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: "finished" | "active") {
    this.templateElement = document.getElementById("project-list")! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.assignedProjects = [];
    const importedNode = document.importNode(this.templateElement.content, true);
    this.element = importedNode.firstElementChild! as HTMLElement;
    projectState.addListener((projects: Project[]) => {
      const relevantProjects = projects.filter((project) => {
        if ((this.type = "active")) {
          return project.projectStatus === ProjectStatus.Active;
        }
        return project.projectStatus === ProjectStatus.Finished;
      });
      this.assignedProjects = relevantProjects;
      this.renderProjects();
    });
    this.attach();
    this.renderContent();
  }

  private renderProjects() {
    const ListEl = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;
    ListEl.innerHTML = "";
    for (const projItem of this.assignedProjects) {
      const projectItem = document.createElement("li");
      projectItem.textContent = projItem.title;
      ListEl!.appendChild(projectItem);
    }
  }
  private attach() {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  }
  private renderContent() {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2")!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }
}

const firstInput = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
