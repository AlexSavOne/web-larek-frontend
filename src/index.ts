import './scss/styles.scss';

import { ShopAPI } from './components/ShopAPI';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/Events';
import { AppState, CatalogChangeEvent } from './components/AppData';
import { Page } from './components/Page';
import { Card } from './components/Card';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/Modal';
import { Basket } from './components/common/Basket';
import { IOrderForm, IProduct } from './types/index';
import { Order } from './components/Order';
import { Success } from './components/common/Success';

const events = new EventEmitter();
const api = new ShopAPI(CDN_URL, API_URL);
const appData = new AppState({}, events);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const order = new Order(cloneTemplate(orderTemplate), events);
const contacts = new Order(cloneTemplate(contactsTemplate), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);

events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appData.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => {
				events.emit('card:select', item);
			},
		});
		return card.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		});
	});
});

events.on<IProduct>('preview:changed', (item: IProduct) => {
	const previewCard = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => events.emit('card:select', item),
	});

	modal.render({
		content: previewCard.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		}),
	});
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

events.on('basket:add', (item: IProduct) => {
	appData.toggleOrderedItem(item.id, true);
	appData.setBasket(appData.order.items);
});

events.on('basket:open', () => {
	modal.render({
		content: createElement<HTMLElement>('div', {}, [basket.render()]),
	});
});

events.on<string[] | undefined>('basket:changed', (items) => {
	if (!items) {
		basket.items = [];
		basket.price = 0;
		return;
	}

	const basketItems: HTMLElement[] = [];
	let totalPrice = 0;

	items.forEach((itemId, index) => {
		const product = appData.catalog.find((product) => product.id === itemId);
		if (!product) return;

		const basketItemTemplate =
			ensureElement<HTMLTemplateElement>('#card-basket');
		const basketItem = cloneTemplate(basketItemTemplate);

		const titleElement = basketItem.querySelector('.card__title');
		const priceElement = basketItem.querySelector('.card__price');
		const indexElement = basketItem.querySelector('.basket__item-index');
		const deleteButton = basketItem.querySelector('.basket__item-delete');

		if (titleElement && priceElement && indexElement && deleteButton) {
			titleElement.textContent = product.title;
			priceElement.textContent =
				product.price !== null ? `${product.price} синапсов` : '0';
			indexElement.textContent = String(index + 1);

			deleteButton.addEventListener('click', () => {
				appData.toggleOrderedItem(itemId, false);
				appData.setBasket(appData.order.items);
			});
		}

		basketItems.push(basketItem);
		totalPrice += product.price ?? 0;
	});

	basket.items = basketItems.filter((item) => item !== null);
	basket.price = totalPrice;
});

events.on('order:open', () => {
	modal.render({
		content: order.render({
			address: '',
			payment: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on(
	'order.address:change',
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value, 'order');
	}
);

events.on('payment:change', (data: { payment: string }) => {
	const { payment } = data;
	appData.setOrderField('payment', payment, 'order');
});

events.on('order:submit', () => {
	modal.render({
		content: contacts.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value, 'order');
		appData.order.total = appData.getTotal();
	}
);

events.on('card:select', (item: IProduct) => {
	const isInBasket = appData.order.items.includes(item.id);

	const previewCard = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			if (isInBasket) return;

			appData.toggleOrderedItem(item.id, true);
			appData.setBasket(appData.order.items);

			previewCard.updateButton('Товар в корзине', true);
		},
	});

	const buttonText = isInBasket ? 'Товар в корзине' : 'Добавить в корзину';
	const isDisabled = item.price === null || item.price === 0;
	previewCard.updateButton(buttonText, isInBasket || isDisabled);

	modal.render({
		content: previewCard.render({
			title: item.title,
			image: item.image,
			price: item.price,
			category: item.category,
		}),
	});
});

events.on('contacts:submit', () => {
	api
		.orderCards(appData.order)
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
					appData.clearBasket();
					basket.clear();
					appData.clearOrderTotal();
					events.emit('basket:changed');
				},
			});

			const successDescription = success.render({});
			const descriptionElement = successDescription.querySelector(
				'.order-success__description'
			);

			if (descriptionElement) {
				descriptionElement.textContent = `Списано ${appData.order.total} синапсов`;
			}

			const closeButton = successDescription.querySelector(
				'.order-success__close'
			);

			if (closeButton) {
				closeButton.addEventListener('click', () => {
					modal.close();
					appData.clearBasket();
					basket.clear();
					appData.clearOrderTotal();
					events.emit('basket:changed');
				});
			}

			modal.render({ content: successDescription });
		})
		.catch((err) => {
			console.error(err);
		});
});

events.on(
	'contacts.email:change',
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value, 'contacts');
		appData.validateOrder('contacts');
	}
);

events.on(
	'contacts.phone:change',
	(data: { field: keyof IOrderForm; value: string }) => {
		appData.setOrderField(data.field, data.value, 'contacts');
		appData.validateOrder('contacts');
	}
);

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { email, phone, payment, address } = errors;

	order.valid = !email && !phone && !payment && !address;
	contacts.valid = !email && !phone && !payment && !address;

	order.errors = Object.values({ email, phone, payment, address })
		.filter((error) => !!error)
		.join('; ');
	contacts.errors = Object.values({ email, phone, payment, address })
		.filter((error) => !!error)
		.join('; ');
});

api
	.getCatalog()
	.then(appData.setCatalog.bind(appData))
	.catch((err) => {
		console.error(err);
	});
