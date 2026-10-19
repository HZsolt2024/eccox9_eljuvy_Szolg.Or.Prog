using System;

namespace api.Models;

public class Items
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public int Price { get; set; }

    public int? CustomerId { get; set; } //Foreign key
    public Customer? Customer { get; set; } //Navigational

}
