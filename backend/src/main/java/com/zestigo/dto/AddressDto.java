package com.zestigo.dto;

import jakarta.validation.constraints.NotBlank;

public class AddressDto {
    private String id;

    @NotBlank(message = "Label is required (e.g. Home, Work)")
    private String label;

    @NotBlank(message = "Address line is required")
    private String line;

    private boolean isDefault;

    public AddressDto() {
    }

    public AddressDto(String id, String label, String line, boolean isDefault) {
        this.id = id;
        this.label = label;
        this.line = line;
        this.isDefault = isDefault;
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

    // Builder
    public static AddressDtoBuilder builder() {
        return new AddressDtoBuilder();
    }

    public static class AddressDtoBuilder {
        private String id;
        private String label;
        private String line;
        private boolean isDefault;

        public AddressDtoBuilder id(String id) { this.id = id; return this; }
        public AddressDtoBuilder label(String label) { this.label = label; return this; }
        public AddressDtoBuilder line(String line) { this.line = line; return this; }
        public AddressDtoBuilder isDefault(boolean isDefault) { this.isDefault = isDefault; return this; }

        public AddressDto build() {
            return new AddressDto(id, label, line, isDefault);
        }
    }
}
