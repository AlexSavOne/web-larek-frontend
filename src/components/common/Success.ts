import { Component } from '../base/Component';

interface ISuccess {
	price: number;
}

interface ISuccessActions {
	onClick: () => void;
}

export class Success extends Component<ISuccess> {
	protected _close: HTMLElement | null;

	constructor(container: HTMLElement, actions: ISuccessActions) {
		super(container);

		this._close = document.getElementById('success');

		if (this._close) {
			if (actions?.onClick) {
				this._close.addEventListener('click', actions.onClick);
			}
		} else {
			console.error('Element with id "success" does not exist');
		}
	}
}
