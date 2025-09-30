package net.cmspos.cmspos.service.implement;

import java.util.List;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.SupplierDto;
import net.cmspos.cmspos.model.entity.Supplier;
import net.cmspos.cmspos.repository.SupplierRepository;
import net.cmspos.cmspos.service.SupplierService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    @Override
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Override
    public Supplier createSupplier(SupplierDto supplierDto) {
        Supplier supplier = new Supplier();
        applyDto(supplier, supplierDto);
        return supplierRepository.save(supplier);
    }

    @Override
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    @Override
    public Supplier updateSupplier(Long id, SupplierDto supplierDto) {
        Supplier supplier = getSupplierById(id);
        applyDto(supplier, supplierDto);
        return supplierRepository.save(supplier);
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplierRepository.delete(supplier);
    }

    private void applyDto(Supplier supplier, SupplierDto dto) {
        supplier.setName(dto.getName());
        supplier.setPhone(dto.getPhone());
        supplier.setEmail(dto.getEmail());
        supplier.setAddress(dto.getAddress());
    }
}
