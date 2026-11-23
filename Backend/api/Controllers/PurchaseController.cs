using System;
using api.Data;
using api.DTOs.Purchase;
using api.Mappers;
using api.Models;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;



[Route("api/purchases")]
[ApiController]

public class PurchaseController : ControllerBase
{
    private readonly ApplicationDBContext _context;

    public PurchaseController(ApplicationDBContext context)
    {
        _context = context;
    }



    //Get every purchase from the database
    [HttpGet]
    public IActionResult GetAll()
    {
        var purchases = _context.Purchases.ToList()
        .Select(p => p.ToPurchaseDTO());
        return Ok(purchases);
    }

    //Get purchases by customerName
    [HttpGet("{customerName}")]
    public IActionResult GetByCustomerName([FromRoute] string customerName)
    {
        var purchases = _context.Purchases.Where(p => p.CustomerName == customerName).ToList()
        .Select(p => p.ToPurchaseDTO());
        return Ok(purchases);
    }

    //Make a purchase
    [HttpPost]
    public IActionResult Create([FromBody] PurchaseDTO purchaseDTO)
    {
        var purchaseModel = new Purchase
        {
            CustomerName = purchaseDTO.CustomerName,
            Date = purchaseDTO.Date,
            TotalAmount = purchaseDTO.TotalAmount,
            Items = purchaseDTO.Items
        };
        _context.Purchases.Add(purchaseModel);
        _context.SaveChanges();
        return CreatedAtAction(nameof(GetByCustomerName), new { customerName = purchaseModel.CustomerName }, purchaseModel.ToPurchaseDTO());
    }
    
}
