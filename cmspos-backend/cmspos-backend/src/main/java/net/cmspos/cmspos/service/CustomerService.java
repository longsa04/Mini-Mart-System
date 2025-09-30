package net.cmspos.cmspos.service;

import net.cmspos.cmspos.model.dto.CustomerDto;
import net.cmspos.cmspos.model.entity.Customer;
import org.springframework.stereotype.Service;

import java.util.List;

public interface CustomerService {
    List<Customer> getAllCustomers();
    Customer createCustomer(CustomerDto customerDto);
    Customer getCustomerById(Long id);
    Customer updateCustomer(Long id, CustomerDto customerDto);
    Customer deleteCustomer(Long id);
}
