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
    public class ProductsControllerTests
    {
        private Mock<DataContext> _mockContext;
        private Mock<DbSet<Product>> _mockSet;
        private ProductsController _controller;
        private List<Product> _productsList;

        [SetUp]
        public void Setup()
        {
            // Create test data
            _productsList = new List<Product>
            {
                new Product { Id = 1, Name = "Product 1", Price = 10, CategoryId = 1, SupplierId = 1, Category = new Category { Id = 1, Name = "Cat 1"}, Supplier = new Supplier { Id = 1, Name = "Sup 1"} },
                new Product { Id = 2, Name = "Product 2", Price = 20, CategoryId = 1, SupplierId = 1, Category = new Category { Id = 1, Name = "Cat 1"}, Supplier = new Supplier { Id = 1, Name = "Sup 1"} }
            };

            var queryable = _productsList.AsQueryable();

            _mockSet = new Mock<DbSet<Product>>();
            
            // Setup for Async support
            _mockSet.As<IAsyncEnumerable<Product>>()
                .Setup(m => m.GetAsyncEnumerator(default))
                .Returns(() => new TestAsyncEnumerator<Product>(queryable.GetEnumerator()));

            _mockSet.As<IQueryable<Product>>()
                .Setup(m => m.Provider)
                .Returns(new TestAsyncQueryProvider<Product>(queryable.Provider));

            _mockSet.As<IQueryable<Product>>().Setup(m => m.Expression).Returns(queryable.Expression);
            _mockSet.As<IQueryable<Product>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            _mockSet.As<IQueryable<Product>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

            _mockContext = new Mock<DataContext>(new DbContextOptions<DataContext>());
            _mockContext.Setup(c => c.Products).Returns(_mockSet.Object);
            // Also setup Set<Product> method if used, but Controller uses property
            
            _controller = new ProductsController(_mockContext.Object);
        }

        [Test]
        public async Task GetProducts_ReturnsAllProducts()
        {
            // Act
            var result = await _controller.GetProducts();

            // Assert
            Assert.That(result.Value, Is.Not.Null);
            var products = result.Value.ToList();
            Assert.That(products.Count, Is.EqualTo(2));
            Assert.That(products[0].Name, Is.EqualTo("Product 1"));
        }

        [Test]
        public async Task GetProduct_ReturnsProduct_WhenIdExists()
        {
            // Act
            var result = await _controller.GetProduct(1);

            // Assert
            Assert.That(result.Value, Is.Not.Null);
            Assert.That(result.Value.Id, Is.EqualTo(1));
            Assert.That(result.Value.Name, Is.EqualTo("Product 1"));
        }

        [Test]
        public async Task GetProduct_ReturnsNotFound_WhenIdDoesNotExist()
        {
            // Act
            var result = await _controller.GetProduct(99);

            // Assert
            Assert.That(result.Result, Is.InstanceOf<NotFoundResult>());
        }

        [Test]
        public async Task PostProduct_AddsProduct_AndReturnsCreated()
        {
            // Arrange
            var newProduct = new Product { Id = 3, Name = "Product 3", Price = 30 };

            // Act
            var result = await _controller.PostProduct(newProduct);

            // Assert
            _mockSet.Verify(m => m.Add(It.IsAny<Product>()), Times.Once);
            _mockContext.Verify(m => m.SaveChangesAsync(default), Times.Once); 
            
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.That(createdResult, Is.Not.Null);
            Assert.That(createdResult.ActionName, Is.EqualTo("GetProduct"));
            Assert.That(((Product)createdResult.Value).Id, Is.EqualTo(3));
        }

        [Test]
        public async Task DeleteProduct_RemovesProduct_WhenExists()
        {
            // Arrange
            _mockSet.Setup(m => m.FindAsync(1)).ReturnsAsync(_productsList.First(p => p.Id == 1));

            // Act
            var result = await _controller.DeleteProduct(1);

            // Assert
            _mockSet.Verify(m => m.Remove(It.IsAny<Product>()), Times.Once);
            _mockContext.Verify(m => m.SaveChangesAsync(default), Times.Once);
            Assert.That(result, Is.InstanceOf<NoContentResult>());
        }
        
        [Test]
        public async Task DeleteProduct_ReturnsNotFound_WhenDoesNotExist()
        {
             // Arrange
            _mockSet.Setup(m => m.FindAsync(99)).ReturnsAsync((Product)null);

            // Act
            var result = await _controller.DeleteProduct(99);

            // Assert
            _mockSet.Verify(m => m.Remove(It.IsAny<Product>()), Times.Never);
            Assert.That(result, Is.InstanceOf<NotFoundResult>());
        }
    }
}
