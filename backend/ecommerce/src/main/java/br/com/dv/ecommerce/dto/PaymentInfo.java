package br.com.dv.ecommerce.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record PaymentInfo(
        @Min(1) Integer amount,
        @NotNull @Pattern(regexp = "^[A-Z]{3}$") String currency,
        @Email String customerEmail
) {
}