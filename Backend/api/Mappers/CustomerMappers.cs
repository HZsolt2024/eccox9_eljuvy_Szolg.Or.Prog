using System;
using api.DTOs.Customer;
using api.Models;
using Microsoft.CodeAnalysis.CSharp.Syntax;

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

    public static Customer ToCustomerFromCreateDTO(this CreateCustomerRequestDTO customerDTO)
    {
        return new Customer
        {
            Name = customerDTO.Name,
            Debt = customerDTO.Debt,
            CreatedOn = customerDTO.CreatedOn
        };
    }
}
