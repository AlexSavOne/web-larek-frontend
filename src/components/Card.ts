import { Component } from './base/Component';
import { ensureElement } from '../utils/utils';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard {
	title: string;
	description?: string | string[];
	image: string;
	id: string;
	category?: string;
	price?: number | null;
	button?: string;
}

export class Card extends Component<ICard> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _category?: HTMLElement;
	protected _price: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._image = ensureElement<HTMLImageElement>('.card__image', container);
		this._button = container.querySelector('.card__button');
		this._description = container.querySelector('.card__text');
		this._category = container.querySelector('.card__category');
		this._price = container.querySelector('.card__price');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', (event) => {
					actions.onClick(event);
				});
			} else {
				container.addEventListener('click', (event) => {
					actions.onClick(event);
				});
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._description, value);
		}
	}

	set price(value: number | null | undefined) {
		if (this._price) {
			if (value !== null && value !== undefined) {
				const priceText = value !== 0 ? `${value} синапсов` : 'Бесценно';
				this._price.textContent = priceText;
			} else {
				this._price.textContent = 'Бесценно';
			}
		}
	}

	set category(value: string | undefined) {
		if (this._category) {
			this.setText(this._category, value || '');
			const englishCategory = this.convertToEnglishCategory(value);
			if (englishCategory) {
				this._category.classList.add(`card__category_${englishCategory}`);
			}
			const categories = ['soft', 'hard', 'other', 'additional', 'button'];
			categories.forEach((category) => {
				if (englishCategory !== category) {
					this._category.classList.remove(`card__category_${category}`);
				}
			});
		}
	}

	private convertToEnglishCategory(
		russianCategory: string | undefined
	): string | undefined {
		switch (russianCategory) {
			case 'софт-скил':
				return 'soft';
			case 'хард-скил':
				return 'hard';
			case 'другое':
				return 'other';
			case 'дополнительное':
				return 'additional';
			case 'кнопка':
				return 'button';
			default:
				return undefined;
		}
	}

	updateButton(text: string, disabled: boolean): void {
		if (this._button) {
			this._button.textContent = text;
			this._button.disabled = disabled;
		}
	}
}
