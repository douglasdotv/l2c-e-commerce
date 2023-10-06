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
import { Observable } from 'rxjs';

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
  cardTypes: string[] = ['Visa', 'MasterCard', 'American Express'];
  cardMonths: number[] = [];
  cardYears: number[] = [];
  currentMonth: number = new Date().getMonth() + 1;
  currentYear: number = new Date().getFullYear();
  totalPrice$!: Observable<number>;
  totalQuantity$!: Observable<number>;

  constructor(
    private formBuilder: FormBuilder,
    private formService: CheckoutFormService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.initializeCheckoutForm();
    this.populateCardDates();
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
      creditCardDetails: this.creditCardDetailsGroup(),
    });
  }

  /**
   * Populate credit card expiration months and years in the checkout form
   * By default, the current month and year are selected
   */
  populateCardDates(): void {
    this.populateCardMonths();
    this.populateCardYears();
  }

  populateCardMonths(): void {
    this.formService
      .getCreditCardMonths(this.currentMonth)
      .subscribe((months) => {
        this.cardMonths = months;
        this.checkoutFormGroup
          .get('creditCardDetails.expirationMonth')
          ?.setValue(this.cardMonths[0]);
      });
  }

  populateCardYears(): void {
    this.formService.getCreditCardYears().subscribe((years) => {
      this.cardYears = years;
      this.checkoutFormGroup
        .get('creditCardDetails.expirationYear')
        ?.setValue(this.currentYear);
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
    this.setupCardNumberChangeListeners();
    this.setupDateChangeListeners();
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

  setupCardNumberChangeListeners(): void {
    this.checkoutFormGroup
      .get('creditCardDetails.cardNumber')
      ?.valueChanges.subscribe((cardNumber) => {
        const firstDigit = cardNumber.charAt(0);
        const firstTwoDigits = cardNumber.substring(0, 2);
        let cardType = this.checkoutFormGroup.get('creditCardDetails.cardType');

        if (firstDigit === '4') {
          cardType?.setValue('Visa');
        } else if (
          (firstTwoDigits >= 51 && firstTwoDigits <= 55) ||
          (firstTwoDigits >= 22 && firstTwoDigits <= 27)
        ) {
          cardType?.setValue('MasterCard');
        } else if (firstTwoDigits === '34' || firstTwoDigits === '37') {
          cardType?.setValue('American Express');
        }
      });
  }

  setupDateChangeListeners(): void {
    this.checkoutFormGroup
      .get('creditCardDetails.expirationYear')
      ?.valueChanges.subscribe((year) => {
        this.updateCardExpirationMonths(Number(year));
      });
  }

  updateCardExpirationMonths(selectedYear: number): void {
    const january: number = 1;
    const startMonth: number =
      selectedYear === this.currentYear ? this.currentMonth : january;

    this.formService.getCreditCardMonths(startMonth).subscribe((months) => {
      this.cardMonths = months;
      this.checkoutFormGroup
        .get('creditCardDetails.expirationMonth')
        ?.setValue(this.cardMonths[0]);
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

  reviewCartDetails(): void {
    this.totalPrice$ = this.cartService.totalPrice;
    this.totalQuantity$ = this.cartService.totalQuantity;
  }

  onSubmit(): void {
    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched();
    } else {
      // TODO: Handle the form submission
    }
  }

  private customerGroup(): FormGroup {
    return this.formBuilder.group({
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z]+$/),
        Validators.minLength(2),
        CustomValidators.notOnlyWhitespace,
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z]+$/),
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
        Validators.pattern(/^[a-zA-Z]+$/),
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

  private creditCardDetailsGroup(): FormGroup {
    return this.formBuilder.group({
      cardType: ['Visa', [Validators.required]],
      nameOnCard: [
        '',
        [
          Validators.required,
          Validators.pattern(/^[a-zA-Z\s,'-]+$/),
          Validators.minLength(2),
        ],
      ],
      cardNumber: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.minLength(13),
          Validators.maxLength(19),
          CustomValidators.luhnCheck,
        ],
      ],
      securityCode: [
        '',
        [
          Validators.required,
          Validators.pattern('^[0-9]+$'),
          Validators.minLength(3),
          Validators.maxLength(4),
        ],
      ],
      expirationMonth: [
        '',
        [Validators.required, Validators.min(1), Validators.max(12)],
      ],
      expirationYear: [
        '',
        [Validators.required, Validators.min(new Date().getFullYear())],
      ],
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

  get creditCardDetailsCardType(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('creditCardDetails.cardType');
  }
  get creditCardDetailsNameOnCard(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('creditCardDetails.nameOnCard');
  }
  get creditCardDetailsCardNumber(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('creditCardDetails.cardNumber');
  }
  get creditCardDetailsSecurityCode(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('creditCardDetails.securityCode');
  }
  get creditCardDetailsExpirationMonth(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('creditCardDetails.expirationMonth');
  }
  get creditCardDetailsExpirationYear(): AbstractControl<any, any> | null {
    return this.checkoutFormGroup.get('creditCardDetails.expirationYear');
  }
}
