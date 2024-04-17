import { Form } from './common/Form';
import { IOrderForm } from '../types';
import { IEvents } from './base/Events';

export class Order extends Form<IOrderForm> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		const paymentButtons = container.querySelectorAll('.order__buttons button');
		paymentButtons.forEach((button) => {
			button.addEventListener('click', () => {
				this.setPayment(button.getAttribute('name') || '');
			});
		});
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value = value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value = value;
	}

	setPayment(value: string) {
		this.events.emit('payment:change', { payment: value });
		const paymentButtons = this.container.querySelectorAll('.order__buttons button');
		paymentButtons.forEach((button) => {
			if (button.getAttribute('name') === value) {
				button.classList.add('active');
			} else {
				button.classList.remove('active');
			}
		});
	}
}
