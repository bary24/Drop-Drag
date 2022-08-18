// /<reference path="../decorators/autobind.ts"/>
// /<reference path="../util/validation.ts" />
// /<reference path="base-component.ts"/>

import { Autobind } from "../decorators/autobind";
import { validate, Validatable } from "../util/validation";
import { Component } from "./base-component";
import { projectState } from "../state/project-state";

//Project input class
export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
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
