using System;
using api.Models;
using api.DTOs.Purchase;


namespace api.Mappers;

public static class PurchaseMapper
{
    public static PurchaseDTO ToPurchaseDTO(this Purchase purchaseModel)
    {
        return new PurchaseDTO
        {
            Id = purchaseModel.Id,
            CustomerName = purchaseModel.CustomerName,
            Date = purchaseModel.Date,
            TotalAmount = purchaseModel.TotalAmount,
            Items = purchaseModel.Items
        };
    }
}
