package net.cmspos.cmspos.service.implement;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import net.cmspos.cmspos.exception.ResourceNotFoundException;
import net.cmspos.cmspos.model.dto.CustomerDto;
import net.cmspos.cmspos.model.entity.Customer;
import net.cmspos.cmspos.repository.CustomerRepository;
import net.cmspos.cmspos.service.CustomerService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;

    @Override
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Override
    public Customer createCustomer(CustomerDto customerDto) {
        Customer customer = new Customer();
        applyDto(customer, customerDto);
        return customerRepository.save(customer);
    }

    @Override
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    @Override
    public Customer updateCustomer(Long id, CustomerDto customerDto) {
        Customer existingCustomer = getCustomerById(id);
        applyDto(existingCustomer, customerDto);
        return customerRepository.save(existingCustomer);
    }

    @Override
    public Customer deleteCustomer(Long id) {
        Customer customer = getCustomerById(id);
        customerRepository.delete(customer);
        return customer;
    }

    private void applyDto(Customer customer, CustomerDto dto) {
        customer.setName(dto.getName());
        customer.setPhone(dto.getPhone());
        customer.setEmail(dto.getEmail());
        customer.setPoints(Optional.ofNullable(dto.getPoints()).orElse(customer.getPoints()));
    }
}
