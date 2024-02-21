import { EventEmitter } from '../components/base/events';

// Интерфейсы ----------------------------------

// Продукт
export interface IProduct {
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number | null;
	addToCartButton: string;
	buyButton: string;
}

// Корзина
export interface IBasketModel {
	items: Map<string, number>;
	add(id: string): void;
	remove(id: string): void;
}

// Форма заказа
export interface IOrderForm {
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
	orderButton: string;
	paymentMethod: 'online' | 'uponDelivery';
}

// Состояние приложения
export interface IAppState {
	products: IProduct[];
	basket: Map<string, number>;
	preview: string | null;
	orders: IOrderForm[] | null;
	loading: boolean;
}

// Каталог товаров
export interface ICatalogModel {
	items: IProduct[]; // Список продуктов в каталоге
}

// Интерфейс для конструктора представления
export interface IViewConstructor {
	new (container: HTMLElement, events?: EventEmitter): IView;
}

// Интерфейс для представления
export interface IView {
	render(data?: object): HTMLElement;
}

// Классы -------------------------------------

// Класс для модели корзины
export class BasketModel implements IBasketModel {
	public items: Map<string, number> = new Map();

	constructor(protected readonly events: EventEmitter) {}

	public add(id: string): void {
		if (!this.items.has(id)) this.items.set(id, 0);
		this.items.set(id, this.items.get(id)! + 1);
		this._changed();
	}

	public remove(id: string): void {
		if (!this.items.has(id)) return;
		if (this.items.get(id)! > 0) {
			this.items.set(id, this.items.get(id)! - 1);
			if (this.items.get(id) === 0) this.items.delete(id);
		}
		this._changed();
	}

	protected _changed() {
		this.events.emit('basket:change', { items: Array.from(this.items.keys()) });
	}
}

// Класс для представления элемента корзины
export class BasketItemView implements IView {
	protected readonly title: HTMLSpanElement;
	protected readonly addButton: HTMLButtonElement;
	protected readonly removeButton: HTMLButtonElement;
	private id: string | null = null;

	constructor(
		protected readonly container: HTMLElement,
		protected readonly events: EventEmitter
	) {
		this.title = container.querySelector('.card__title') as HTMLSpanElement;
		this.addButton = container.querySelector(
			'.card__button'
		) as HTMLButtonElement;
		this.removeButton = container.querySelector(
			'.basket__item-delete'
		) as HTMLButtonElement;

		this.addButton.addEventListener('click', () => {
			this.events.emit('ui:basket-add', { id: this.id });
		});

		this.removeButton.addEventListener('click', () => {
			this.events.emit('ui:basket-remove', { id: this.id });
		});
	}

	public render(data: { id: string; title: string }): HTMLElement {
		if (data) {
			this.id = data.id;
			this.title.textContent = data.title;
		}
		return this.container;
	}
}

// Класс для представления корзины
export class BasketView implements IView {
	constructor(protected readonly container: HTMLElement) {}

	public render(data: { items: HTMLElement[] }): HTMLElement {
		if (data) {
			this.container.replaceChildren(...data.items);
		}
		return this.container;
	}
}
