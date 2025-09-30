package net.cmspos.cmspos.service;

import java.util.List;
import net.cmspos.cmspos.model.dto.SupplierDto;
import net.cmspos.cmspos.model.entity.Supplier;

public interface SupplierService {
    List<Supplier> getAllSuppliers();

    Supplier createSupplier(SupplierDto supplierDto);

    Supplier getSupplierById(Long id);

    Supplier updateSupplier(Long id, SupplierDto supplierDto);

    void deleteSupplier(Long id);
}
