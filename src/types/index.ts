import { EventEmitter } from '../components/base/Events';

export interface IProduct {
	about: string;
	id: string;
	title: string;
	description: string;
	image: string;
	category: string;
	price: number | null;
	button: string;
}

export interface IModalData {
	content: HTMLElement;
}

export interface IBasketView {
	items: HTMLElement[];
	price: number;
	selected: string[];
}

export type FormErrors = Partial<Record<keyof IOrder, string>>;

export interface IAppState {
	products: IProduct[];
	basket: IBasketItem[];
	preview: string | null;
	orders: IOrder[];
	loading: boolean;
	formErrors: FormErrors;
}

export interface IOrderForm {
	address: string;
	payment: string;
	email: string;
	phone: string;
}

export interface IOrder extends IOrderForm {
	items: string[];
	total: number;
}

export interface IOrderResult {
	id: string;
}

export interface IShopAPI {
	getCatalog: () => Promise<IProduct[]>;
	orderCards: (order: IOrder) => Promise<IOrderResult>;
}

export interface IFormState {
	valid: boolean;
	errors: string[];
}

export interface IBasketItem {
	id: string;
	quantity: number;
	image: string;
}

export interface ICard<T> {
	title: string;
	description?: string | string[];
	image: string;
	status: T;
}

export interface IViewConstructor {
	new (container: HTMLElement, events?: EventEmitter): IView;
}

export interface IView {
	render(data?: object): HTMLElement;
}
