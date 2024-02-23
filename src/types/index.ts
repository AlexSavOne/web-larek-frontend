import { EventEmitter } from '../components/base/events';

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
	id: string;
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

// Карточка товара
export interface ICard<T> {
	title: string;
	description?: string | string[];
	image: string;
	status: T;
}

// Интерфейс для конструктора представления
export interface IViewConstructor {
	new (container: HTMLElement, events?: EventEmitter): IView;
}

// Интерфейс для представления
export interface IView {
	render(data?: object): HTMLElement;
}
