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
    public class UsersControllerTests
    {
        private Mock<DataContext> _mockContext;
        private Mock<DbSet<User>> _mockSet;
        private UsersController _controller;
        private List<User> _usersList;

        [SetUp]
        public void Setup()
        {
            _usersList = new List<User>
            {
                new User { Id = 1, Username = "User 1", Role = new Role { Name = "Admin" } },
                new User { Id = 2, Username = "User 2", Role = new Role { Name = "Comptable" } }
            };

            var queryable = _usersList.AsQueryable();

            _mockSet = new Mock<DbSet<User>>();
            
            _mockSet.As<IAsyncEnumerable<User>>()
                .Setup(m => m.GetAsyncEnumerator(default))
                .Returns(() => new TestAsyncEnumerator<User>(queryable.GetEnumerator()));

            _mockSet.As<IQueryable<User>>()
                .Setup(m => m.Provider)
                .Returns(new TestAsyncQueryProvider<User>(queryable.Provider));

            _mockSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(queryable.Expression);
            _mockSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(queryable.ElementType);
            _mockSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(() => queryable.GetEnumerator());

            _mockContext = new Mock<DataContext>(new DbContextOptions<DataContext>());
            _mockContext.Setup(c => c.Users).Returns(_mockSet.Object);
            
            _controller = new UsersController(_mockContext.Object);
        }

        [Test]
        public async Task GetUsers_ReturnsAllUsers()
        {
            var result = await _controller.GetUsers();
            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);
            var users = okResult.Value as IEnumerable<User>;
            Assert.That(users.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task GetUser_ReturnsUser_WhenIdExists()
        {
            _mockSet.Setup(m => m.FindAsync(1)).ReturnsAsync(_usersList.First(u => u.Id == 1));
            
            var result = await _controller.GetUser(1);
            
            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);
            var user = okResult.Value as User;
            Assert.That(user.Id, Is.EqualTo(1));
        }

        [Test]
        public async Task DeleteUser_RemovesUser()
        {
            _mockSet.Setup(m => m.FindAsync(1)).ReturnsAsync(_usersList.First(u => u.Id == 1));
            
            var result = await _controller.DeleteUser(1);
            
            _mockSet.Verify(m => m.Remove(It.IsAny<User>()), Times.Once);
            Assert.That(result, Is.InstanceOf<NoContentResult>());
        }
    }
}
