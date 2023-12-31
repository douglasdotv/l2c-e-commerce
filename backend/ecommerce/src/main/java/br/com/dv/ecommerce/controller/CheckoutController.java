package br.com.dv.ecommerce.controller;

import br.com.dv.ecommerce.dto.PaymentInfo;
import br.com.dv.ecommerce.dto.Purchase;
import br.com.dv.ecommerce.dto.PurchaseResponse;
import br.com.dv.ecommerce.service.CheckoutService;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/checkout")
@RestController
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/purchase")
    public ResponseEntity<PurchaseResponse> placeOrder(@Valid @RequestBody Purchase purchase) {
        return ResponseEntity.ok(checkoutService.placeOrder(purchase));
    }

    @PostMapping("/payment-intent")
    public ResponseEntity<String> createPaymentIntent(@Valid @RequestBody PaymentInfo paymentInfo)
            throws StripeException {
        PaymentIntent paymentIntent = checkoutService.createPaymentIntent(paymentInfo);
        return ResponseEntity.ok(paymentIntent.toJson());
    }

}
