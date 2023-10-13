package br.com.dv.ecommerce.dto;

import br.com.dv.ecommerce.entity.Address;
import br.com.dv.ecommerce.entity.Customer;
import br.com.dv.ecommerce.entity.Order;
import br.com.dv.ecommerce.entity.OrderItem;

import java.util.Set;

public record Purchase(
        Customer customer,
        Address shippingAddress,
        Address billingAddress,
        Order order,
        Set<OrderItem> orderItems
) {
}
