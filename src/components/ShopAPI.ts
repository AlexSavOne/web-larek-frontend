// файл components/ShopAPI.ts:
import { Api, ApiListResponse } from './base/api';
import { IProduct, ICartItem } from '../types';

export interface IShopAPI {
	getCart: () => Promise<Map<string, number>>;
	addToCart: (item: ICartItem) => Promise<void>;
	removeFromCart: (itemId: string) => Promise<void>;
	getCatalog: () => Promise<IProduct[]>;
	getOrderInfo: () => Promise<IOrder>;
}

export class ShopAPI extends Api implements IShopAPI {
	constructor(baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
	}

	getCart(): Promise<Map<string, number>> {
		return this.get('/cart');
	}

	addToCart(item: ICartItem): Promise<void> {
		return this.post('/cart/add', item);
	}

	removeFromCart(itemId: string): Promise<void> {
		return this.post(`/cart/remove/${itemId}`);
	}

	getCatalog(): Promise<IProduct[]> {
		return this.get('/catalog');
	}

	getOrderInfo(): Promise<IOrder> {
		return this.get('/order/info');
	}
}
