package br.com.dv.ecommerce.service;

import br.com.dv.ecommerce.dao.CustomerRepository;
import br.com.dv.ecommerce.dto.Purchase;
import br.com.dv.ecommerce.dto.PurchaseResponse;
import br.com.dv.ecommerce.entity.Address;
import br.com.dv.ecommerce.entity.Customer;
import br.com.dv.ecommerce.entity.Order;
import br.com.dv.ecommerce.entity.OrderItem;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.Optional;
import java.util.UUID;

@Service
public class CheckoutServiceImpl implements CheckoutService {

    private final CustomerRepository customerRepository;

    public CheckoutServiceImpl(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
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

    private String generateOrderTrackingNumber() {
        return UUID.randomUUID().toString();
    }

}
