package net.cmspos.cmspos.service;

import net.cmspos.cmspos.model.entity.Category;
import org.springframework.stereotype.Service;

import java.util.List;

public interface CategoryService {
    Category createCategory(Category category);
    Category getCategoryById(Long id);
    List<Category> getAllCategories();
    Category updateCategory(Long id, Category category);
    Category deleteCategory(Long id);
}
