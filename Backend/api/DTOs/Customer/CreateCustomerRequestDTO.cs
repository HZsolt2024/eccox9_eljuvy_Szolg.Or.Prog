using System;

namespace api.DTOs.Customer;

public class CreateCustomerRequestDTO
{
    public string Name { get; set; } = string.Empty;
    public int Debt { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.Now;
}
