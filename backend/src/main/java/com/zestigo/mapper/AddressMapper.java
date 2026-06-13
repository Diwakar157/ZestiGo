package com.zestigo.mapper;

import com.zestigo.dto.AddressDto;
import com.zestigo.entity.Address;

public class AddressMapper {
    public static AddressDto toDto(Address address) {
        if (address == null) return null;
        return AddressDto.builder()
                .id(address.getId())
                .label(address.getLabel())
                .line(address.getLine())
                .isDefault(address.isDefault())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .placeId(address.getPlaceId())
                .build();
    }
}

