using System;
using api.Data;
using api.Mappers;
using Microsoft.AspNetCore.Mvc;


namespace api.Controllers;

[Route("api/customer")]
[ApiController]
public class CustomerController : ControllerBase
{
    private readonly ApplicationDBContext _context;
    public CustomerController(ApplicationDBContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var customers = _context.Customers.ToList()
        .Select(c => c.ToCustomerDTO());

        return Ok(customers);
    }

    [HttpGet("{id}")]
    public IActionResult GetById([FromRoute] int id)
    {
        var customer = _context.Customers.Find(id);

        if (customer == null)
        {
            return NotFound();
        }

        return Ok(customer.ToCustomerDTO());
    }

}
