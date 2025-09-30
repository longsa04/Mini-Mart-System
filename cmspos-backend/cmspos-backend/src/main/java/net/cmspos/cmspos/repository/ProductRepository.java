package net.cmspos.cmspos.repository;

import net.cmspos.cmspos.model.entity.Category;
import net.cmspos.cmspos.model.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
//    @Query("SELECT p FROM Product p WHERE p.category =: category")
//    List<Product> findProductByCategory(@Param("category") Category category);
    List<Product> findProductByCategory(Category category);

}
