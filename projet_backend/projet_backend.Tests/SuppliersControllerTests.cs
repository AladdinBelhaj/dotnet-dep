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
    public class SuppliersControllerTests
    {
        private Mock<DataContext> _mockContext;
        private Mock<DbSet<Supplier>> _mockSet;
        private SuppliersController _controller;
        private List<Supplier> _suppliersList;

        [SetUp]
        public void Setup()
        {
            _suppliersList = new List<Supplier>
            {
                new Supplier { Id = 1, Name = "Sup 1" },
                new Supplier { Id = 2, Name = "Sup 2" }
            };

            var queryable = _suppliersList.AsQueryable();

            _mockSet = new Mock<DbSet<Supplier>>();
            
            _mockSet.As<IAsyncEnumerable<Supplier>>()
                .Setup(m => m.GetAsyncEnumerator(default))
                .Returns(() => new TestAsyncEnumerator<Supplier>(queryable.GetEnumerator()));

            _mockSet.As<IQueryable<Supplier>>()
                .Setup(m => m.Provider)
                .Returns(new TestAsyncQueryProvider<Supplier>(queryable.Provider));

            _mockSet.As<IQueryable<Supplier>>().Setup(m => m.Expression).Returns(queryable.Expression);
            _mockSet.As<IQueryable<Supplier>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            _mockSet.As<IQueryable<Supplier>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

            _mockContext = new Mock<DataContext>(new DbContextOptions<DataContext>());
            _mockContext.Setup(c => c.Suppliers).Returns(_mockSet.Object);
            
            _controller = new SuppliersController(_mockContext.Object);
        }

        [Test]
        public async Task GetSuppliers_ReturnsAllSuppliers()
        {
            var result = await _controller.GetSuppliers();
            Assert.That(result.Value, Is.Not.Null);
            Assert.That(result.Value.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task GetSupplier_ReturnsSupplier_WhenIdExists()
        {
            _mockSet.Setup(m => m.FindAsync(1)).ReturnsAsync(_suppliersList.First(s => s.Id == 1));
            
            var result = await _controller.GetSupplier(1);
            
            Assert.That(result.Value, Is.Not.Null);
            Assert.That(result.Value.Id, Is.EqualTo(1));
        }

        [Test]
        public async Task PostSupplier_AddsSupplier()
        {
            var newSup = new Supplier { Id = 3, Name = "Sup 3" };
            var result = await _controller.PostSupplier(newSup);
            
            _mockSet.Verify(m => m.Add(It.IsAny<Supplier>()), Times.Once);
            _mockContext.Verify(m => m.SaveChangesAsync(default), Times.Once);
            
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.That(createdResult, Is.Not.Null);
            Assert.That(((Supplier)createdResult.Value).Id, Is.EqualTo(3));
        }

        [Test]
        public async Task DeleteSupplier_RemovesSupplier()
        {
            _mockSet.Setup(m => m.FindAsync(1)).ReturnsAsync(_suppliersList.First(s => s.Id == 1));
            
            var result = await _controller.DeleteSupplier(1);
            
            _mockSet.Verify(m => m.Remove(It.IsAny<Supplier>()), Times.Once);
            Assert.That(result, Is.InstanceOf<NoContentResult>());
        }
    }
}
