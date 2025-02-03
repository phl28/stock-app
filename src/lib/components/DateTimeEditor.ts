import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';

export class DateTimeEditor implements ICellEditorComp {
	container!: HTMLDivElement;
	eInput!: HTMLInputElement;

	constructor() {}

	init(params: ICellEditorParams) {
		this.container = document.createElement('div');
		this.eInput = document.createElement('input');
		this.eInput.type = 'datetime-local';
		this.eInput.value = new Date(params.value).toISOString().slice(0, 16);
		this.eInput.style.opacity = '0';
		this.eInput.style.position = 'absolute';
		this.eInput.style.height = '1px';
		this.eInput.style.width = '1px';
		this.container.appendChild(this.eInput);
	}

	getGui() {
		return this.container;
	}

	afterGuiAttached() {
		this.eInput.showPicker();
	}

	getValue() {
		return new Date(this.eInput.value).toISOString();
	}

	destroy() {}

	isPopup() {
		return true;
	}

	getPopupPosition() {
		return 'under' as const;
	}
}
