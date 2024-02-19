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

export interface IBasketItem {
	id: string;
	quantity: number;
	deleteIcon: string;
}

export interface IOrderForm {
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
	orderButton: string;
	paymentMethod: 'online' | 'uponDelivery';
	status: 'pending' | 'paid' | 'shipped' | 'delivered';
}

export interface IOrder extends IOrderForm {
	items: string[];
}

export interface IAppState {
	products: IProduct[];
	basket: IBasketItem[];
	preview: string | null;
	orders: IOrderForm[] | null;
	loading: boolean;
	currentStep: 'payment' | 'personalInfo' | 'confirmation';
}
