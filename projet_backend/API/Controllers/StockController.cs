using API.DTOs;
using Context;
using Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class StockController : ControllerBase
    {
        private readonly DataContext _context;

        public StockController(DataContext context)
        {
            _context = context;
        }

        [HttpPost("movement")]
        public async Task<IActionResult> AddMovement(StockMovementDto request)
        {
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null) return NotFound("Product not found");

            int quantityChange = request.Quantity;
            if (request.Type == "Exit")
            {
                quantityChange = -Math.Abs(request.Quantity);
            }
            else
            {
                quantityChange = Math.Abs(request.Quantity);
            }

            // check valid stock for exit
            if (request.Type == "Exit" && product.Quantity + quantityChange < 0)
            {
                return BadRequest($"Insufficient stock. Current: {product.Quantity}");
            }

            // Update Product
            product.Quantity += quantityChange;
            
            // Audit
            // Get User Id from claims
            var username = User.FindFirstValue(ClaimTypes.Name);
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == username);
            int userId = user?.Id ?? 0; // Should not happen if authorized, but safe fallback

            var movement = new StockMovement
            {
                ProductId = request.ProductId,
                Quantity = quantityChange,
                Type = request.Type,
                MovementDate = DateTime.Now,
                UserId = userId
            };

            _context.StockMovements.Add(movement);
            
            await _context.SaveChangesAsync();

            // Alert check
            if (product.Quantity < product.MinStock)
            {
                return Ok(new { Message = "Movement recorded. WARNING: Stock below minimum!", CurrentStock = product.Quantity });
            }

            return Ok(new { Message = "Movement recorded", CurrentStock = product.Quantity });
        }

        [HttpGet("history")]
        public async Task<ActionResult<IEnumerable<StockMovement>>> GetHistory()
        {
            return await _context.StockMovements
                .Include(m => m.Product)
                .Include(m => m.User)
                .OrderByDescending(m => m.MovementDate)
                .ToListAsync();
        }
    }
}
