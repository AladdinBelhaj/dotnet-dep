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
    public class CategoriesControllerTests
    {
        private Mock<DataContext> _mockContext;
        private Mock<DbSet<Category>> _mockSet;
        private CategoriesController _controller;
        private List<Category> _categoriesList;

        [SetUp]
        public void Setup()
        {
            _categoriesList = new List<Category>
            {
                new Category { Id = 1, Name = "Cat 1" },
                new Category { Id = 2, Name = "Cat 2" }
            };

            var queryable = _categoriesList.AsQueryable();

            _mockSet = new Mock<DbSet<Category>>();
            
            _mockSet.As<IAsyncEnumerable<Category>>()
                .Setup(m => m.GetAsyncEnumerator(default))
                .Returns(() => new TestAsyncEnumerator<Category>(queryable.GetEnumerator()));

            _mockSet.As<IQueryable<Category>>()
                .Setup(m => m.Provider)
                .Returns(new TestAsyncQueryProvider<Category>(queryable.Provider));

            _mockSet.As<IQueryable<Category>>().Setup(m => m.Expression).Returns(queryable.Expression);
            _mockSet.As<IQueryable<Category>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            _mockSet.As<IQueryable<Category>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

            _mockContext = new Mock<DataContext>(new DbContextOptions<DataContext>());
            _mockContext.Setup(c => c.Categories).Returns(_mockSet.Object);
            
            _controller = new CategoriesController(_mockContext.Object);
        }

        [Test]
        public async Task GetCategories_ReturnsAllCategories()
        {
            var result = await _controller.GetCategories();
            Assert.That(result.Value, Is.Not.Null);
            Assert.That(result.Value.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task GetCategory_ReturnsCategory_WhenIdExists()
        {
            _mockSet.Setup(m => m.FindAsync(1)).ReturnsAsync(_categoriesList.First(c => c.Id == 1));
            
            var result = await _controller.GetCategory(1);
            
            Assert.That(result.Value, Is.Not.Null);
            Assert.That(result.Value.Id, Is.EqualTo(1));
        }

        [Test]
        public async Task PostCategory_AddsCategory()
        {
            var newCat = new Category { Id = 3, Name = "Cat 3" };
            var result = await _controller.PostCategory(newCat);
            
            _mockSet.Verify(m => m.Add(It.IsAny<Category>()), Times.Once);
            _mockContext.Verify(m => m.SaveChangesAsync(default), Times.Once);
            
            var createdResult = result.Result as CreatedAtActionResult;
            Assert.That(createdResult, Is.Not.Null);
            Assert.That(((Category)createdResult.Value).Id, Is.EqualTo(3));
        }

        [Test]
        public async Task DeleteCategory_RemovesCategory()
        {
            _mockSet.Setup(m => m.FindAsync(1)).ReturnsAsync(_categoriesList.First(c => c.Id == 1));
            
            var result = await _controller.DeleteCategory(1);
            
            _mockSet.Verify(m => m.Remove(It.IsAny<Category>()), Times.Once);
            Assert.That(result, Is.InstanceOf<NoContentResult>());
        }
    }
}
