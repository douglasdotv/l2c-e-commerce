package br.com.dv.ecommerce.dto;

public record PaymentInfo(
        Integer amount,
        String currency
) {
}
