using System;
using api.DTOs.Customer;
using api.Models;

namespace api.Mappers;

public static class CustomerMappers
{
    public static CustomerDTO ToCustomerDTO(this Customer customerModel)
    {
        return new CustomerDTO
        {
            Id = customerModel.Id,
            Name = customerModel.Name,
            Debt = customerModel.Debt,
            CreatedOn = customerModel.CreatedOn
        };
    }
}
