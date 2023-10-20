import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CheckoutFormService } from 'src/app/services/checkout-form.service';
import { CartService } from 'src/app/services/cart.service';
import { CustomValidators } from 'src/app/validators/custom-validators';
import { BehaviorSubject, Observable } from 'rxjs';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Order } from 'src/app/common/order';
import { CartItem } from 'src/app/common/cart-item';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { Customer } from 'src/app/common/customer';
import { Address } from 'src/app/common/address';
import { environment } from 'src/environments/environment';
import { PaymentInfo } from 'src/app/common/payment-info';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  // Credit card details are handled by Stripe Elements
  stripe: any = Stripe(environment.stripePublishableKey);
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: string = '';

  totalPrice$!: Observable<number>;
  totalQuantity$!: Observable<number>;

  paymentButtonIsDisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private formService: CheckoutFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService
  ) {}

  ngOnInit(): void {
    this.setupStripePaymentForm();
    this.initializeCheckoutForm();
    this.populateCountriesAndStates();
    this.setupValueChangeListeners();
    this.reviewCartDetails();
  }

  initializeCheckoutForm(): void {
    /**
     * Form groups and form controls
     */
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.customerGroup(),
      shippingAddress: this.addressGroup(),
      billingAddress: this.addressGroup(),
      creditCardDetails: '' // Credit card details are handled by Stripe Elements
    });
  }

  /**
   * Populate countries and states
   * By default, the first country in the list is selected
   * Then, the states of the selected country are populated and the first state in the list is selected
   */
  populateCountriesAndStates(): void {
    this.populateCountries();
  }

  populateCountries(): void {
    this.formService.getCountries().subscribe((countries) => {
      this.countries = countries;
      const defaultCountry = this.countries[0];
      this.checkoutFormGroup
        .get('shippingAddress.country')
        ?.setValue(defaultCountry);
      this.checkoutFormGroup
        .get('billingAddress.country')
        ?.setValue(defaultCountry);
      this.updateStatesForCountry(defaultCountry, 'shippingAddress');
      this.updateStatesForCountry(defaultCountry, 'billingAddress');
    });
  }

  updateStatesForCountry(country: Country | null, addressType: string): void {
    if (!country) {
      return;
    }

    this.formService
      .getStatesByCountryCode(country.code)
      .subscribe((states) => {
        if (addressType === 'shippingAddress') {
          this.shippingAddressStates = states;
          this.checkoutFormGroup
            .get('shippingAddress.state')
            ?.setValue(this.shippingAddressStates[0]);
        } else {
          this.billingAddressStates = states;
          this.checkoutFormGroup
            .get('billingAddress.state')
            ?.setValue(this.billingAddressStates[0]);
        }
      });
  }

  /**
   * Listen to value changes in the checkout form
   * When the country changes, the states are updated
   * When the credit card number changes, the credit card type is updated
   * When the credit card expiration year changes, the months are updated
   */
  setupValueChangeListeners(): void {
    this.setupCountryChangeListeners();
  }

  setupCountryChangeListeners(): void {
    this.checkoutFormGroup
      .get('shippingAddress.country')
      ?.valueChanges.subscribe((country) => {
        this.updateStatesForCountry(country, 'shippingAddress');
      });

    this.checkoutFormGroup
      .get('billingAddress.country')
      ?.valueChanges.subscribe((country) => {
        this.updateStatesForCountry(country, 'billingAddress');
      });
  }

  copyShippingAddressToBillingAddress(event: any): void {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
    }
  }

  setupStripePaymentForm(): void {
    // Get Stripe Elements
    const elements = this.stripe.elements();

    // Create an instance of the card Element
    this.cardElement = elements.create(
      'card',
      { hidePostalCode: true }
    );

    // Add an instance of the card Element into the `card-element` <div>
    this.cardElement.mount('#card-element');

    // Handle real-time validation errors from the card Element
    this.cardElement.addEventListener('change', (event: any) => {
      if (event.error) {
        this.displayError = event.error.message;
      } else {
        this.displayError = '';
      }
    });
  }

  reviewCartDetails(): void {
    this.totalPrice$ = this.cartService.totalPrice;
    this.totalQuantity$ = this.cartService.totalQuantity;
  }

  onSubmit(): void {
    if (this.checkoutFormGroup.invalid || this.displayError !== '') {
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }

    // Disable the payment button to prevent multiple clicks
    this.paymentButtonIsDisabled = true;

    // Set up order
    const order: Order = new Order(
      (this.cartService.totalPrice as BehaviorSubject<number>).value,
      (this.cartService.totalQuantity as BehaviorSubject<number>).value
    );

    // Create orderItems from cartItems
    const cartItems: CartItem[] = this.cartService.cartItems;
    const orderItems: OrderItem[] = cartItems.map(
      (item) => new OrderItem(item)
    );

    // Get customer and address info from the form
    const customer: Customer =
      this.checkoutFormGroup.controls['customer'].value;

    const rawShippingAddress =
      this.checkoutFormGroup.controls['shippingAddress'].value;
    const rawBillingAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;

    const shippingAddress: Address = {
      ...rawShippingAddress,
      country: rawShippingAddress.country.name,
      state: rawShippingAddress.state.name,
    };
    const billingAddress: Address = {
      ...rawBillingAddress,
      country: rawBillingAddress.country.name,
      state: rawBillingAddress.state.name,
    };

    // Compute Stripe payment info
    this.paymentInfo.amount = Math.round(order.totalPrice);
    this.paymentInfo.currency = 'usd';
    this.paymentInfo.email = customer.email;

    // Create payment intent
    this.checkoutService
      .createPaymentIntent(this.paymentInfo)
      .subscribe((paymentIntentResponse) => {
        this.stripe
          .confirmCardPayment(
            paymentIntentResponse.client_secret,
            {
              payment_method: {
                card: this.cardElement,
                billing_details: {
                  name: `${customer.firstName} ${customer.lastName}`,
                  email: customer.email,
                  address: {
                    city: shippingAddress.city,
                    country: shippingAddress.country,
                    state: shippingAddress.state,
                    line1: shippingAddress.street,
                    line2: null,
                    postal_code: shippingAddress.zipCode,
                  },
                },
              },
            },
            { handleActions: false }
          )
          .then(
            (result: {
              error: { message: any };
              paymentIntent: { status: string };
            }) => {
              if (result.error) {
                alert(result.error.message);
                this.paymentButtonIsDisabled = false;
              } else if (result.paymentIntent.status === 'succeeded') {
                const purchase: Purchase = new Purchase(
                  customer,
                  shippingAddress,
                  billingAddress,
                  order,
                  orderItems
                );
                this.checkoutService.placeOrder(purchase).subscribe({
                  next: (response) => {
                    alert(
                      `Your order has been received!\nYou can track it: ${response.orderTrackingNumber}`
                    );
                    this.resetForm();
                    this.cartService.resetCart();
                    this.paymentButtonIsDisabled = false;
                  },
                  error: (e) => {
                    alert(`Error: ${e.message}`);
                    this.paymentButtonIsDisabled = false;
                  },
                });
              }
            }
          );
      });
  }

  private resetForm(): void {
    this.checkoutFormGroup.reset();
  }

  private customerGroup(): FormGroup {
    return this.formBuilder.group({
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\u00C0-\u017F\s]+$/),
        Validators.minLength(2),
        CustomValidators.notOnlyWhitespace,
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\u00C0-\u017F\s]+$/),
        Validators.minLength(2),
        CustomValidators.notOnlyWhitespace,
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(
          '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$'
        ),
        CustomValidators.notOnlyWhitespace,
      ]),
    });
  }

  private addressGroup(): FormGroup {
    return this.formBuilder.group({
      country: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      city: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z\u00C0-\u017F\s]+$/),
        Validators.minLength(2),
        CustomValidators.notOnlyWhitespace,
      ]),
      street: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        CustomValidators.notOnlyWhitespace,
      ]),
      zipCode: new FormControl('', [
        Validators.required,
        Validators.pattern('^[0-9]{7,8}$'),
        CustomValidators.notOnlyWhitespace,
      ]),
    });
  }

  get firstName(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('customer.firstName');
  }
  get lastName(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('customer.lastName');
  }
  get email(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('customer.email');
  }
  get shippingAddressCountry(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('shippingAddress.country');
  }
  get shippingAddressState(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('shippingAddress.state');
  }
  get shippingAddressCity(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('shippingAddress.city');
  }
  get shippingAddressStreet(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('shippingAddress.street');
  }
  get shippingAddressZipCode(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('shippingAddress.zipCode');
  }
  get billingAddressCountry(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('billingAddress.country');
  }
  get billingAddressState(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('billingAddress.state');
  }
  get billingAddressCity(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('billingAddress.city');
  }
  get billingAddressStreet(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('billingAddress.street');
  }
  get billingAddressZipCode(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('billingAddress.zipCode');
  }
}
