import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { PencilLine } from 'lucide-svelte';

export class RRCellRenderer implements ICellRendererComp {
	eGui!: HTMLSpanElement;

	init(params: ICellRendererParams) {
		this.eGui = document.createElement('span');
		this.eGui.style.display = 'flex';
		this.eGui.style.alignItems = 'center';
		this.eGui.style.width = '100%';
		this.eGui.style.position = 'relative';

		const iconContainer = document.createElement('span');
		iconContainer.style.position = 'absolute';
		iconContainer.style.left = '2px';

		const valueSpan = document.createElement('span');
		valueSpan.textContent = `${params.value}:1`;
		valueSpan.style.width = '100%';
		valueSpan.style.textAlign = 'center';

		new PencilLine({
			target: iconContainer,
			props: {
				size: 20,
				strokeWidth: 1.5
			}
		});

		this.eGui.appendChild(iconContainer);
		this.eGui.appendChild(valueSpan);
	}

	getGui() {
		return this.eGui;
	}

	refresh(): boolean {
		return false;
	}
}
