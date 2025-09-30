package net.cmspos.cmspos.service.implement;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.ProductDto;
import net.cmspos.cmspos.model.entity.Category;
import net.cmspos.cmspos.model.entity.Product;
import net.cmspos.cmspos.repository.CategoryRepository;
import net.cmspos.cmspos.repository.ProductRepository;
import net.cmspos.cmspos.service.ProductService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Product createProduct(ProductDto productDto) {
        Product product = new Product();
        applyDto(product, productDto);
        return productRepository.save(product);
    }

    @Override
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product with id " + id + " not found"));
    }

    @Override
    public Product updateProduct(Long id, ProductDto productDto) {
        Product existingProduct = getProductById(id);
        applyDto(existingProduct, productDto);
        return productRepository.save(existingProduct);
    }

    @Override
    public List<Product> getProductsByCategory(Long id) {
        Category category = resolveCategory(id).orElseThrow(() ->
                new ResourceNotFoundException("Category with id " + id + " not found"));
        return productRepository.findProductByCategory(category);
    }

    @Override
    public Product deleteProduct(Long id) {
        Product product = getProductById(id);
        productRepository.delete(product);
        return product;
    }

    private void applyDto(Product product, ProductDto dto) {
        product.setName(dto.getName());
        product.setPrice(dto.getPrice());
        product.setSku(dto.getSku());
        product.setCategory(resolveCategory(dto.getCategoryId()).orElse(null));
    }

    private Optional<Category> resolveCategory(Long categoryId) {
        if (categoryId == null) {
            return Optional.empty();
        }
        return categoryRepository.findById(categoryId);
    }
}
