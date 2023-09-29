import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  checkoutFormGroup!: FormGroup;
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
  defaultAddress!: any;

  constructor(private formBuilder: FormBuilder) {}

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
}
