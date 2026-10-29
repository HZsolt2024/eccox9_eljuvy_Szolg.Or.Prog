using System;

namespace api.DTOs.Customer;

public class CustomerDTO
{
    public int Id { get; set; }  //Primary key
    public string Name { get; set; } = string.Empty;
    public int Debt { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.Now;
}
