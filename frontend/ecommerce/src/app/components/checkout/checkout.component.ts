import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CheckoutFormService } from 'src/app/services/checkout-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
  defaultAddress!: any;
  countries: string[] = [
    'Brazil',
    'Canada',
    'Germany',
    'Japan',
    'Sweden',
    'Mexico',
    'South Korea',
    'China',
    'Malaysia',
    'Singapore',
  ];
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
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: [''],
      }),
      shippingAddress: this.formBuilder.group({
        country: ['Brazil'],
        state: [''],
        city: [''],
        street: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        country: ['Brazil'],
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

    this.defaultAddress =
      this.checkoutFormGroup.controls['billingAddress'].value;

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
  }

  onSubmit(): void {
    // TODO: do checkout process here
    console.log(this.checkoutFormGroup.get('customer')?.value);
  }

  copyShippingAddressToBillingAddress(event: any): void {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
    } else {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.defaultAddress
      );
    }
  }

  handleMonthsAndYears(): void {
    const selectedYear: number = Number(
      this.checkoutFormGroup.get('creditCardDetails')?.value.expirationYear
    );

    /**
     * startMonth is January by default.
     * If the current year equals the selected year, then startMonth is the current month.
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
