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
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private formService: CheckoutFormService
  ) {}

  ngOnInit(): void {
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

    /**
     * Populate months and years
     */
    this.formService
      .getCreditCardMonths(this.currentMonth)
      .subscribe((months) => {
        this.cardMonths = months;
        if (this.cardMonths.length > 0) {
          this.checkoutFormGroup
            .get('creditCardDetails.expirationMonth')
            ?.setValue(this.cardMonths[0]);
        }
      });

    this.formService.getCreditCardYears().subscribe((years) => {
      this.cardYears = years;
      if (this.cardYears.length > 0) {
        this.checkoutFormGroup
          .get('creditCardDetails.expirationYear')
          ?.setValue(this.cardYears[0]);
      }
    });

    /**
     * Populate countries and states
     * By default, the first country in the list is selected
     * Then, the states of the selected country are populated and the first state in the list is selected
     */
    this.formService.getCountries().subscribe((countries) => {
      this.countries = countries;

      if (this.countries.length > 0) {
        this.checkoutFormGroup
          .get('shippingAddress.country')
          ?.setValue(this.countries[0]);

        this.checkoutFormGroup
          .get('billingAddress.country')
          ?.setValue(this.countries[0]);

        this.formService
          .getStatesByCountryCode(this.countries[0].code)
          .subscribe((states) => {
            this.shippingAddressStates = states;
            this.billingAddressStates = states;

            if (states.length > 0) {
              this.checkoutFormGroup
                .get('shippingAddress.state')
                ?.setValue(this.shippingAddressStates[0]);

              this.checkoutFormGroup
                .get('billingAddress.state')
                ?.setValue(this.billingAddressStates[0]);
            }
          });
      }

      /**
       * Listen to country changes
       * When the country changes, the states of the selected country are populated
       * and the first state in the list is selected
       */
      this.checkoutFormGroup
        .get('shippingAddress.country')
        ?.valueChanges.subscribe((value) => {
          this.formService
            .getStatesByCountryCode(value.code)
            .subscribe((states) => {
              this.shippingAddressStates = states;

              if (states.length > 0) {
                this.checkoutFormGroup
                  .get('shippingAddress.state')
                  ?.setValue(this.shippingAddressStates[0]);
              }
            });
        });

      this.checkoutFormGroup
        .get('billingAddress.country')
        ?.valueChanges.subscribe((value) => {
          this.formService
            .getStatesByCountryCode(value.code)
            .subscribe((states) => {
              this.billingAddressStates = states;

              if (states.length > 0) {
                this.checkoutFormGroup
                  .get('billingAddress.state')
                  ?.setValue(this.billingAddressStates[0]);
              }
            });
        });
    });
  }

  onSubmit(): void {
    // Checkout logic goes here. Coming soon…
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

  handleMonthsAndYears(): void {
    const selectedYear: number = Number(
      this.checkoutFormGroup.get('creditCardDetails')?.value.expirationYear
    );

    /**
     * startMonth is January by default
     * If the current year equals the selected year, then startMonth is the current month
     */
    let startMonth: number = 1;
    if (this.currentYear === selectedYear) {
      startMonth = this.currentMonth;
    }

    this.formService
      .getCreditCardMonths(startMonth)
      .subscribe((months) => (this.cardMonths = months));

    if (this.currentYear === selectedYear && this.cardMonths.length > 0) {
      this.checkoutFormGroup
        .get('creditCardDetails.expirationMonth')
        ?.setValue(this.cardMonths[0]);
    }
  }
}
