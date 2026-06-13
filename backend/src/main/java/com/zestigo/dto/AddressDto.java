package com.zestigo.dto;

import jakarta.validation.constraints.NotBlank;

public class AddressDto {
    private String id;

    @NotBlank(message = "Label is required (e.g. Home, Work)")
    private String label;

    @NotBlank(message = "Address line is required")
    private String line;

    private boolean isDefault;

    private Double latitude;

    private Double longitude;

    private String placeId;

    public AddressDto() {
    }

    public AddressDto(String id, String label, String line, boolean isDefault,
                      Double latitude, Double longitude, String placeId) {
        this.id = id;
        this.label = label;
        this.line = line;
        this.isDefault = isDefault;
        this.latitude = latitude;
        this.longitude = longitude;
        this.placeId = placeId;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getLine() { return line; }
    public void setLine(String line) { this.line = line; }

    public boolean isDefault() { return isDefault; }
    public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getPlaceId() { return placeId; }
    public void setPlaceId(String placeId) { this.placeId = placeId; }

    // Builder
    public static AddressDtoBuilder builder() {
        return new AddressDtoBuilder();
    }

    public static class AddressDtoBuilder {
        private String id;
        private String label;
        private String line;
        private boolean isDefault;
        private Double latitude;
        private Double longitude;
        private String placeId;

        public AddressDtoBuilder id(String id) { this.id = id; return this; }
        public AddressDtoBuilder label(String label) { this.label = label; return this; }
        public AddressDtoBuilder line(String line) { this.line = line; return this; }
        public AddressDtoBuilder isDefault(boolean isDefault) { this.isDefault = isDefault; return this; }
        public AddressDtoBuilder latitude(Double latitude) { this.latitude = latitude; return this; }
        public AddressDtoBuilder longitude(Double longitude) { this.longitude = longitude; return this; }
        public AddressDtoBuilder placeId(String placeId) { this.placeId = placeId; return this; }

        public AddressDto build() {
            return new AddressDto(id, label, line, isDefault, latitude, longitude, placeId);
        }
    }
}

