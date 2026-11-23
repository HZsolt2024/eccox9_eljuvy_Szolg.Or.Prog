using System;

namespace api.DTOs.Purchase;


public class PurchaseDTO
{
    public int Id {get; set;}
    public string CustomerName {get; set;} = string.Empty;
    public DateTime Date {get; set;} = DateTime.Now;
    public int TotalAmount {get; set;}
    public List <string> Items {get; set;} = new List<string>();

}
