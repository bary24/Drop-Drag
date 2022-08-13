"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
//Validate function
function validate(validatableInput) {
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
function Autobind(_, __, descriptor) {
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
var ProjectStatus;
(function (ProjectStatus) {
    ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
    ProjectStatus[ProjectStatus["Finished"] = 1] = "Finished";
})(ProjectStatus || (ProjectStatus = {}));
/////////////////////////////////////////////    Classes //////////////////////////////////////
//Project Class
class Project {
    constructor(id, title, description, numOfPeople, projectStatus) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.numOfPeople = numOfPeople;
        this.projectStatus = projectStatus;
    }
}
//Project state class
class ProjectState {
    constructor() {
        this.projects = [];
        this.listeners = [];
    }
    addListener(listenerFn) {
        this.listeners.push(listenerFn);
    }
    static getInstance() {
        if (this.instance) {
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addProject(title, description, numOfPeople) {
        const newProject = new Project(Math.floor(Math.random() * 100).toString(), title, description, numOfPeople, ProjectStatus.Active);
        this.projects.push(newProject);
        for (const listener of this.listeners) {
            listener(this.projects.slice());
        }
    }
}
const projectState = ProjectState.getInstance();
//Project input class
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById("project-input");
        this.hostElement = document.getElementById("app");
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = "user-input";
        this.titleInputElement = this.element.querySelector("#title");
        this.descriptionInputElement = this.element.querySelector("#description");
        this.peopleInputElement = this.element.querySelector("#people");
        this.config();
        this.attach();
    }
    attach() {
        this.hostElement.insertAdjacentElement("afterbegin", this.element);
    }
    submitHandler(event) {
        event.preventDefault();
        const userInput = this.gatherUserinput();
        if (Array.isArray(userInput)) {
            const [enteredTitle, enteredDesc, enteredPeople] = userInput;
            console.log(enteredTitle, enteredDesc, enteredPeople);
            projectState.addProject(...userInput);
        }
        this.clearInput();
    }
    config() {
        this.element.addEventListener("submit", this.submitHandler);
    }
    gatherUserinput() {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = this.peopleInputElement.value;
        const finalTitle = {
            value: title,
            required: true,
        };
        const finalDescription = {
            value: description,
            maxLength: 20,
            minLength: 3,
        };
        const finalPeople = {
            value: +people,
            max: 15,
            min: 5,
        };
        if (!validate(finalTitle) || !validate(finalDescription) || !validate(finalPeople)) {
            alert("Invalid input value");
            return;
        }
        else {
            console.log([title, description, +people]);
            return [title, description, +people];
        }
    }
    clearInput() {
        this.titleInputElement.value = "";
        this.descriptionInputElement.value = "";
        this.peopleInputElement.value = "";
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "submitHandler", null);
///Project List Class////
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById("project-list");
        this.hostElement = document.getElementById("app");
        this.assignedProjects = [];
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        projectState.addListener((projects) => {
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
    renderProjects() {
        const ListEl = document.getElementById(`${this.type}-projects-list`);
        ListEl.innerHTML = "";
        for (const projItem of this.assignedProjects) {
            const projectItem = document.createElement("li");
            projectItem.textContent = projItem.title;
            ListEl.appendChild(projectItem);
        }
    }
    attach() {
        this.hostElement.insertAdjacentElement("beforeend", this.element);
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector("ul").id = listId;
        this.element.querySelector("h2").textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
}
const firstInput = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
