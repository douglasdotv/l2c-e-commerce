package br.com.dv.ecommerce.service;

import br.com.dv.ecommerce.dto.PaymentInfo;
import br.com.dv.ecommerce.dto.Purchase;
import br.com.dv.ecommerce.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;

}
