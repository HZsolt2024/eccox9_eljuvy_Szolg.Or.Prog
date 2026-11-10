using System;
using api.Models;
using api.DTOs.Items;


namespace api.Mappers;

public static class ItemMappers
{
    public static ItemsDTO ToItemsDTO(this Items itemModel)
    {
        return new ItemsDTO
        {
            Id = itemModel.Id,
            Name = itemModel.Name,
            Price = itemModel.Price,
            CustomerId = itemModel.CustomerId
        };
    }
}
