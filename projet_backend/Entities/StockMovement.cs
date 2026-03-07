using System.ComponentModel.DataAnnotations;

namespace Entities
{
    public class StockMovement
    {
        [Key]
        public int Id { get; set; }
        
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public int Quantity { get; set; } // Positive for Entry, Negative for Exit
        public DateTime MovementDate { get; set; } = DateTime.Now;

        public int UserId { get; set; } // Audit: Who did it?
        public User? User { get; set; }
        
        public string Type { get; set; } = "Entry"; // "Entry" or "Exit" - redundant with Quantity sign but good for filtering
    }
}
