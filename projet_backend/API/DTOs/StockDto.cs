namespace API.DTOs
{
    public class StockMovementDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } 
        public string Type { get; set; } = "Entry";
    }
}
