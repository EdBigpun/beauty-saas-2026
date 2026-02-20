package com.estilo26.api.dto;

public class ClientDTO {

    private String clientName;
    private String clientPhone;
    private Long totalVisits;
    // --- NUEVO: Espacio para el Barbero ---
    private String preferredBarber;

    // Actualizamos el constructor para recibir al barbero
    public ClientDTO(String clientName, String clientPhone, Long totalVisits, String preferredBarber) {
        this.clientName = clientName;
        this.clientPhone = clientPhone;
        this.totalVisits = totalVisits;
        this.preferredBarber = preferredBarber;
    }

    // Getters
    public String getClientName() { return clientName; }
    public String getClientPhone() { return clientPhone; }
    public Long getTotalVisits() { return totalVisits; }
    public String getPreferredBarber() { return preferredBarber; } // NUEVO GETTER

    // Setters
    public void setClientName(String clientName) { this.clientName = clientName; }
    public void setClientPhone(String clientPhone) { this.clientPhone = clientPhone; }
    public void setTotalVisits(Long totalVisits) { this.totalVisits = totalVisits; }
    public void setPreferredBarber(String preferredBarber) { this.preferredBarber = preferredBarber; }
}
