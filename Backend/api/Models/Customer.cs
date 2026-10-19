using System;

namespace api.Models;

public class Customer
{
    public int Id { get; set; }  //Primary key
    public string Name { get; set; } = string.Empty;
    public int Debt { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.Now;
    
}
