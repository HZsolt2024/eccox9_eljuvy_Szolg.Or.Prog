using System;

namespace api.DTOs.Items;

//DTO for GET
public class ItemsDTO
{
    public int Id { get; set; } //Primary key
    public string Name { get; set; } = string.Empty;
    public int Price { get; set; }

    public int? CustomerId { get; set; } //Foreign key
}
