using Context;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly DataContext _context;

        public DashboardController(DataContext context)
        {
            _context = context;
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var totalStock = await _context.Products.SumAsync(p => p.Quantity);
            var lowStockProducts = await _context.Products
                .Where(p => p.Quantity < p.MinStock)
                .Select(p => new { p.Name, p.Quantity, p.MinStock })
                .ToListAsync();

            // "Most consumed products" - Sum of absolute negative movements
            var topProducts = await _context.StockMovements
                .Where(m => m.Quantity < 0)
                .GroupBy(m => m.ProductId)
                .Select(g => new 
                { 
                    ProductId = g.Key, 
                    TotalConsumed = g.Sum(m => -m.Quantity) 
                })
                .OrderByDescending(x => x.TotalConsumed)
                .Take(5)
                .ToListAsync();
            
            // Join with Product names (client side or another query? EF can do it)
            // Simpler: Fetch top products details
            var topProductIds = topProducts.Select(t => t.ProductId).ToList();
            var productsDetails = await _context.Products
                .Where(p => topProductIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id, p => p.Name);

            var topProductsWithNames = topProducts.Select(t => new
            {
                Name = productsDetails.ContainsKey(t.ProductId) ? productsDetails[t.ProductId] : "Unknown",
                t.TotalConsumed
            });

            return Ok(new
            {
                TotalStock = totalStock,
                LowStockAlerts = lowStockProducts,
                TopConsumedProducts = topProductsWithNames
            });
        }
    }
}
