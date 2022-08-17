//An interface for the validatble input//
export interface Validatable {
	value: string | number;
	required?: boolean;
	maxLength?: number;
	minLength?: number;
	max?: number;
	min?: number;
}

//Validate function
export function validate(validatableInput: Validatable) {
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
