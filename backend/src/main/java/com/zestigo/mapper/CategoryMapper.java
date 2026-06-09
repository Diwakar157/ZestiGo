package com.zestigo.mapper;

import com.zestigo.dto.CategoryDto;
import com.zestigo.entity.Category;

public class CategoryMapper {
    public static CategoryDto toDto(Category category) {
        if (category == null) return null;
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .icon(category.getIcon())
                .image(category.getImageUrl())
                .build();
    }
}
