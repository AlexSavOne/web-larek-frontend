import _ from 'lodash';
import { Model } from './base/Model';
import { FormErrors, IAppState, IOrder, IProduct, IOrderForm } from '../types';

export type CatalogChangeEvent = {
	catalog: IProduct[];
};

export class AppState extends Model<IAppState> {
	basket: string[];
	catalog: IProduct[];
	loading: boolean;
	order: IOrder = {
		email: '',
		phone: '',
		address: '',
		payment: '',
		items: [],
		total: 0,
	};
	preview: string | null;
	formErrors: FormErrors = {};

	toggleOrderedItem(id: string, isIncluded: boolean) {
		if (isIncluded) {
			this.order.items = _.uniq([...this.order.items, id]);
		} else {
			this.order.items = _.without(this.order.items, id);
		}
	}

	clearBasket() {
		this.order.items.forEach((id) => {
			this.toggleOrderedItem(id, false);
		});
	}

	getTotal() {
		return this.order.items.reduce(
			(a, c) => a + (this.catalog.find((it) => it.id === c)?.price || 0),
			0
		);
	}

	clearOrderTotal() {
		this.order.total = 0;
	}

	setCatalog(products: IProduct[]) {
		this.catalog = products;
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: IProduct) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	setBasket(items: string[]) {
		this.basket = items;
		this.events.emit('basket:changed', this.basket);
	}

	setOrderField(field: keyof IOrderForm, value: string, formType: string) {
		if (formType === 'order') {
			this.order[field] = value;
		} else if (formType === 'contacts') {
			this.order[field] = value;
		}

		if (this.validateOrder(formType)) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder(formType: string) {
		const errors: typeof this.formErrors = {};

		if (formType === 'order') {
			if (!this.order.payment) {
				errors.payment = 'Необходимо выбрать способ оплаты';
			}
			if (!this.order.address) {
				errors.address = 'Необходимо ввести адрес доставки';
			}
		} else if (formType === 'contacts') {
			if (!this.order.email) {
				errors.email = 'Необходимо указать email';
			}
			if (!this.order.phone) {
				errors.phone = 'Необходимо указать телефон';
			}
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);

		if (formType === 'order') {
			const isValid = Object.keys(errors).length === 0;
			if (isValid) {
				this.events.emit('order:ready', this.order);
			}
		}

		return Object.keys(errors).length === 0;
	}
}
