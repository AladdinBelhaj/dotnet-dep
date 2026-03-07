using API.Controllers;
using API.DTOs;
using Context;
using Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace projet_backend.Tests
{
    [TestFixture]
    public class StockControllerTests
    {
        private Mock<DataContext> _mockContext;
        private Mock<DbSet<Product>> _mockProducts;
        private Mock<DbSet<StockMovement>> _mockMovements;
        private Mock<DbSet<User>> _mockUsers;
        private StockController _controller;
        private List<Product> _productsList;

        [SetUp]
        public void Setup()
        {
            // Products
            _productsList = new List<Product>
            {
                new Product { Id = 1, Name = "P1", Quantity = 10, MinStock = 5 }
            };
            var prodQuery = _productsList.AsQueryable();
            _mockProducts = new Mock<DbSet<Product>>();
            SetupDbSet(_mockProducts, prodQuery);
            _mockProducts.Setup(m => m.FindAsync(1)).ReturnsAsync(_productsList.First());

            // Movements (Store logic requires SaveChanges to work)
            _mockMovements = new Mock<DbSet<StockMovement>>();
            
            // Users
            var users = new List<User> { new User { Id = 99, Username = "testuser" } };
            var usersQuery = users.AsQueryable();
            _mockUsers = new Mock<DbSet<User>>();
            SetupDbSet(_mockUsers, usersQuery);

            _mockContext = new Mock<DataContext>(new DbContextOptions<DataContext>());
            _mockContext.Setup(c => c.Products).Returns(_mockProducts.Object);
            _mockContext.Setup(c => c.StockMovements).Returns(_mockMovements.Object);
            _mockContext.Setup(c => c.Users).Returns(_mockUsers.Object);

            _controller = new StockController(_mockContext.Object);

            // Mock User Claims
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.Name, "testuser"),
            }, "mock"));

            _controller.ControllerContext = new ControllerContext()
            {
                HttpContext = new DefaultHttpContext() { User = user }
            };
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
        public async Task AddMovement_Entry_IncreasesStock()
        {
            var dto = new StockMovementDto { ProductId = 1, Quantity = 5, Type = "Entry" };
            
            var result = await _controller.AddMovement(dto);
            
            Assert.That(_productsList[0].Quantity, Is.EqualTo(15)); // 10 + 5
            _mockMovements.Verify(m => m.Add(It.IsAny<StockMovement>()), Times.Once);
            _mockContext.Verify(m => m.SaveChangesAsync(default), Times.Once);
            
            var okResult = result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);
        }

        [Test]
        public async Task AddMovement_Exit_DecreasesStock()
        {
            var dto = new StockMovementDto { ProductId = 1, Quantity = 3, Type = "Exit" };
            
            var result = await _controller.AddMovement(dto);
            
            Assert.That(_productsList[0].Quantity, Is.EqualTo(7)); // 10 - 3
        }

        [Test]
        public async Task AddMovement_Exit_InsufficientStock_ReturnsBadRequest()
        {
            var dto = new StockMovementDto { ProductId = 1, Quantity = 20, Type = "Exit" }; // > 10
            
            var result = await _controller.AddMovement(dto);
            
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            Assert.That(_productsList[0].Quantity, Is.EqualTo(10)); // Unchanged
        }
    }
}
