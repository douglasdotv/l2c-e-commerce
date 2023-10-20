package br.com.dv.ecommerce.service;

import br.com.dv.ecommerce.dao.CustomerRepository;
import br.com.dv.ecommerce.dto.PaymentInfo;
import br.com.dv.ecommerce.dto.Purchase;
import br.com.dv.ecommerce.dto.PurchaseResponse;
import br.com.dv.ecommerce.entity.Customer;
import br.com.dv.ecommerce.entity.Order;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    private final CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository,
                               @Value("${stripe.key.secret}") String stripeSecretKey) {
        this.customerRepository = customerRepository;
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    @Override
    public PurchaseResponse placeOrder(Purchase purchase) {
        Order order = purchase.order();

        String orderTrackingNumber = generateOrderTrackingNumber();

        order.setOrderTrackingNumber(orderTrackingNumber);

        order.setShippingAddress(purchase.shippingAddress());
        order.setBillingAddress(purchase.billingAddress());

        purchase.orderItems().forEach(order::add);

        Optional<Customer> customerOptional = customerRepository.findByEmail(purchase.customer().getEmail());
        Customer customer = customerOptional.orElseGet(purchase::customer);
        customer.add(order);
        customerRepository.save(customer);

        return new PurchaseResponse(orderTrackingNumber);
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {
        List<String> paymentMethodTypes = List.of("card");

        Map<String, Object> params = Map.of(
                "amount", paymentInfo.amount(),
                "currency", paymentInfo.currency(),
                "payment_method_types", paymentMethodTypes,
                "receipt_email", paymentInfo.customerEmail()
        );

        return PaymentIntent.create(params);
    }

    private String generateOrderTrackingNumber() {
        return UUID.randomUUID().toString();
    }

}