package com.estilo26.api.dto;

import lombok.Data;

@Data // Lombok genera los getters y setters automáticamente
public class LoginRequestDTO {
    private String username;
    private String password;
}
