using System;
using api.Data;
using api.DTOs.Purchase;
using api.Mappers;
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
}
