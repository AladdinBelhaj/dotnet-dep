using API.Controllers;
using Context;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace projet_backend.Tests
{
    [TestFixture]
    public class DashboardControllerTests
    {
        private Mock<DataContext> _mockContext;
        private Mock<DbSet<Product>> _mockProducts;
        private Mock<DbSet<StockMovement>> _mockMovements;
        private DashboardController _controller;

        [SetUp]
        public void Setup()
        {
            // Products Data
            var products = new List<Product>
            {
                new Product { Id = 1, Name = "P1", Quantity = 10, MinStock = 5 },
                new Product { Id = 2, Name = "P2", Quantity = 2, MinStock = 5 }, // Low stock
                new Product { Id = 3, Name = "P3", Quantity = 100, MinStock = 10 }
            };
            var prodQuery = products.AsQueryable();
            _mockProducts = new Mock<DbSet<Product>>();
            SetupDbSet(_mockProducts, prodQuery);

            // Stock Movements Data (negative for consumption)
            var movements = new List<StockMovement>
            {
                new StockMovement { ProductId = 1, Quantity = -5 },
                new StockMovement { ProductId = 1, Quantity = -2 }, // Total -7 for P1
                new StockMovement { ProductId = 2, Quantity = -1 }  // Total -1 for P2
            };
            var movQuery = movements.AsQueryable();
            _mockMovements = new Mock<DbSet<StockMovement>>();
            SetupDbSet(_mockMovements, movQuery);

            _mockContext = new Mock<DataContext>(new DbContextOptions<DataContext>());
            _mockContext.Setup(c => c.Products).Returns(_mockProducts.Object);
            _mockContext.Setup(c => c.StockMovements).Returns(_mockMovements.Object);

            _controller = new DashboardController(_mockContext.Object);
        }

        private void SetupDbSet<T>(Mock<DbSet<T>> mockSet, IQueryable<T> data) where T : class
        {
            mockSet.As<IAsyncEnumerable<T>>()
                .Setup(m => m.GetAsyncEnumerator(default))
                .Returns(() => new TestAsyncEnumerator<T>(data.GetEnumerator()));
            mockSet.As<IQueryable<T>>().Setup(m => m.Provider).Returns(new TestAsyncQueryProvider<T>(data.Provider));
            mockSet.As<IQueryable<T>>().Setup(m => m.Expression).Returns(data.Expression);
            mockSet.As<IQueryable<T>>().Setup(m => m.ElementType).Returns(data.ElementType);
            mockSet.As<IQueryable<T>>().Setup(m => m.GetEnumerator()).Returns(() => data.GetEnumerator());
        }

        [Test]
        public async Task GetStats_ReturnsCorrectFigures()
        {
            // Act
            var result = await _controller.GetStats();

            // Assert
            var okResult = result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);
            
            // Use Reflection to access properties of anonymous type
            var value = okResult.Value;
            var type = value.GetType();
            
            var totalStock = (int)type.GetProperty("TotalStock").GetValue(value);
            Assert.That(totalStock, Is.EqualTo(112));

            var lowStock = (IEnumerable<object>)type.GetProperty("LowStockAlerts").GetValue(value);
            Assert.That(lowStock.Count(), Is.EqualTo(1));
            
            // Access nested property Name on anonymous item
            var p2 = lowStock.First();
            Assert.That(p2.GetType().GetProperty("Name").GetValue(p2), Is.EqualTo("P2"));

            var top = (IEnumerable<object>)type.GetProperty("TopConsumedProducts").GetValue(value);
            Assert.That(top.Count(), Is.EqualTo(2));
            
            var t1 = top.First();
            Assert.That(t1.GetType().GetProperty("Name").GetValue(t1), Is.EqualTo("P1"));
            Assert.That(t1.GetType().GetProperty("TotalConsumed").GetValue(t1), Is.EqualTo(7));
        }
    }
}
