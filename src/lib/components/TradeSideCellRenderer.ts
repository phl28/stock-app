import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { CircleArrowUp, CircleArrowDown } from 'lucide-svelte';

export class TradeSideCellRenderer implements ICellRendererComp {
	eGui!: HTMLSpanElement;

	init(params: ICellRendererParams) {
		this.eGui = document.createElement('span');
		this.eGui.style.display = 'flex';
		this.eGui.style.alignItems = 'center';
		this.eGui.style.width = '100%';
		this.eGui.style.height = '100%';

		params.value === 'BUY'
			? new CircleArrowUp({
					target: this.eGui,
					props: {
						size: 20,
						strokeWidth: 1.5
					}
				})
			: new CircleArrowDown({
					target: this.eGui,
					props: {
						size: 20,
						strokeWidth: 1.5
					}
				});
	}

	getGui() {
		return this.eGui;
	}

	refresh(params: ICellRendererParams): boolean {
		return false;
	}
}
