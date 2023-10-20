package br.com.dv.ecommerce.dto;

import br.com.dv.ecommerce.entity.Address;
import br.com.dv.ecommerce.entity.Customer;
import br.com.dv.ecommerce.entity.Order;
import br.com.dv.ecommerce.entity.OrderItem;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public record Purchase(
        @NotNull Customer customer,
        @NotNull Address shippingAddress,
        @NotNull Address billingAddress,
        @NotNull Order order,
        @NotEmpty Set<OrderItem> orderItems
) {
}
