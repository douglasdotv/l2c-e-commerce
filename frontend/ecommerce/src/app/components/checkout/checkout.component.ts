import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { CheckoutFormService } from 'src/app/services/checkout-form.service';

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

  constructor(
    private formBuilder: FormBuilder,
    private formService: CheckoutFormService
  ) {}

  ngOnInit(): void {
    this.initializeCheckoutForm();
    this.populateCardDates();
    this.populateCountriesAndStates();
    this.setupValueChangeListeners();
  }

  initializeCheckoutForm(): void {
    /**
     * Form groups and form controls
     */
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        country: [''],
        state: [''],
        city: [''],
        street: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        country: [''],
        state: [''],
        city: [''],
        street: [''],
        zipCode: [''],
      }),
      creditCardDetails: this.formBuilder.group({
        cardType: ['Visa'],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
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
   * When the credit card expiration year changes, the months are updated
   */
  setupValueChangeListeners(): void {
    this.setupCountryChangeListeners();
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

  onSubmit(): void {
    // Checkout logic goes here. Coming soon…
  }
}
