package net.cmspos.cmspos.repository.purchase;

import java.util.List;
import net.cmspos.cmspos.model.entity.purchase.PurchaseOrder;
import net.cmspos.cmspos.model.entity.purchase.PurchaseOrderDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PurchaseOrderDetailRepository extends JpaRepository<PurchaseOrderDetail, Long> {
    List<PurchaseOrderDetail> findByPurchaseOrder(PurchaseOrder purchaseOrder);
}
