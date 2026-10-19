using System;
using api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace api.Data;

public class ApplicationDBContext : DbContext
{
    public ApplicationDBContext(DbContextOptions<ApplicationDBContext> options) : base(options)
    {

    }
    DbSet<Customer> Customers { get; set; } //Add table
    DbSet<Items> Items { get; set; } //Add table
}
