import type { ICellEditorComp, ICellEditorParams } from 'ag-grid-community';

export class DateTimeEditor implements ICellEditorComp {
	container!: HTMLDivElement;
	eInput!: HTMLInputElement;
	confirmButton!: HTMLButtonElement;
	dateTimeSelected!: Date;

	constructor() {}

	init(params: ICellEditorParams) {
		this.container = document.createElement('div');
		this.container.style.display = 'flex';
		this.container.style.flexDirection = 'column';
		this.container.style.gap = '8px';
		this.container.style.padding = '8px';
		this.container.style.borderRadius = '4px';
		this.container.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';

		this.eInput = document.createElement('input');
		this.eInput.type = 'datetime-local';
		const initialDate = params.value ? new Date(params.value) : new Date();
		this.eInput.value = initialDate.toISOString().slice(0, 16);
		this.dateTimeSelected = initialDate;

		this.eInput.style.padding = '8px';
		this.eInput.style.border = '1px solid #ddd';
		this.eInput.style.borderRadius = '4px';
		this.eInput.style.width = '100%';
		this.eInput.style.boxSizing = 'border-box';
		this.eInput.style.fontSize = '14px';

		this.confirmButton = document.createElement('button');
		this.confirmButton.textContent = 'Confirm';
		this.confirmButton.classList.add('btn', 'btn-neutral', 'btn-block', 'btn-sm');

		this.confirmButton.onclick = () => {
			params.stopEditing();
		};

		this.container.appendChild(this.eInput);
		this.container.appendChild(this.confirmButton);

		this.eInput.addEventListener('input', () => {
			this.changeDate(this.eInput.value);
		});
	}

	changeDate(value: string) {
		this.dateTimeSelected = new Date(value);
	}

	getGui() {
		return this.container;
	}

	afterGuiAttached() {
		if (this.eInput.showPicker) {
			this.eInput.showPicker();
		}
		this.eInput.focus();
	}

	getValue() {
		return this.dateTimeSelected;
	}

	destroy() {
		this.container.removeChild(this.eInput);
		this.container.removeChild(this.confirmButton);
	}

	isPopup() {
		return true;
	}

	getPopupPosition() {
		return 'under' as const;
	}
}
