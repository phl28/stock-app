import type { ICellRendererComp, ICellRendererParams } from 'ag-grid-community';
import { CircleArrowUp, CircleArrowDown } from 'lucide-svelte';
import { mount } from 'svelte';

interface TradeSideCellRendererParams extends ICellRendererParams {
	badge?: boolean;
}
export class TradeSideCellRenderer implements ICellRendererComp {
	eGui!: HTMLSpanElement;

	init(params: TradeSideCellRendererParams) {
		this.eGui = document.createElement('span');
		this.eGui.style.display = 'flex';
		this.eGui.style.alignItems = 'center';
		this.eGui.style.width = '100%';
		this.eGui.style.height = '100%';

		if (params.badge) {
			const badgeDiv = document.createElement('div');
			const badgeText = params.value.toUpperCase();
			badgeDiv.className = `badge badge-sm ${badgeText === 'BUY' || badgeText === 'LONG' ? 'badge-success' : 'badge-error'}`;
			badgeDiv.appendChild(document.createTextNode(badgeText));
			this.eGui.appendChild(badgeDiv);
		} else {
			if (params.value === 'BUY') {
				mount(CircleArrowUp, {
					target: this.eGui,
					props: {
						size: 20,
						strokeWidth: 1.5
					}
				});
			} else {
				mount(CircleArrowDown, {
					target: this.eGui,
					props: {
						size: 20,
						strokeWidth: 1.5
					}
				});
			}
		}
	}

	getGui() {
		return this.eGui;
	}

	refresh(): boolean {
		return false;
	}
}
