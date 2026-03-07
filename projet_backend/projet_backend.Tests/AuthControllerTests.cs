using API.Controllers;
using API.DTOs;
using Context;
using Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Moq;
using NUnit.Framework;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace projet_backend.Tests
{
    [TestFixture]
    public class AuthControllerTests
    {
        private Mock<DataContext> _mockContext;
        private Mock<DbSet<User>> _mockUsers;
        private Mock<DbSet<Role>> _mockRoles;
        private Mock<IConfiguration> _mockConfig;
        private Mock<IConfigurationSection> _mockConfigSection;
        private AuthController _controller;
        private List<User> _usersList;
        private List<Role> _rolesList;

        [SetUp]
        public void Setup()
        {
            // Roles
            _rolesList = new List<Role>
            {
                new Role { Id = 1, Name = "Admin" },
                new Role { Id = 2, Name = "Comptable" }
            };
            var roleQuery = _rolesList.AsQueryable();
            _mockRoles = new Mock<DbSet<Role>>();
            SetupDbSet(_mockRoles, roleQuery);
            _mockRoles.Setup(m => m.FindAsync(1)).ReturnsAsync(_rolesList[0]);
            _mockRoles.Setup(m => m.FindAsync(2)).ReturnsAsync(_rolesList[1]);

            // Users
            _usersList = new List<User>();
            var userQuery = _usersList.AsQueryable();
            _mockUsers = new Mock<DbSet<User>>();
            SetupDbSet(_mockUsers, userQuery);

            _mockContext = new Mock<DataContext>(new DbContextOptions<DataContext>());
            _mockContext.Setup(c => c.Users).Returns(_mockUsers.Object);
            _mockContext.Setup(c => c.Roles).Returns(_mockRoles.Object);

            // Configuration
            _mockConfig = new Mock<IConfiguration>();
            _mockConfigSection = new Mock<IConfigurationSection>();
            _mockConfigSection.Setup(s => s.Value).Returns("super secret key for testing purposes must be long enough to satisfy the minimum length requirements for hmac sha512 signature which is sixty four bytes");
            _mockConfig.Setup(c => c.GetSection("AppSettings:Token")).Returns(_mockConfigSection.Object);

            _controller = new AuthController(_mockContext.Object, _mockConfig.Object);
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
        public async Task Register_CreatesUser_WhenUsernameIsUnique()
        {
            var dto = new RegisterDto { Username = "newuser", Password = "password", RoleId = 2 };

            var result = await _controller.Register(dto);

            _mockUsers.Verify(m => m.Add(It.IsAny<User>()), Times.Once);
            _mockContext.Verify(m => m.SaveChangesAsync(default), Times.Once);
            
            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);
            var user = okResult.Value as User;
            Assert.That(user.Username, Is.EqualTo("newuser"));
            Assert.That(user.PasswordHash, Is.Not.Null);
        }

        [Test]
        public async Task Register_ReturnsBadRequest_WhenUserExists()
        {
            // First add a user
            _usersList.Add(new User { Username = "existing", Role = _rolesList[0] });
            
            var dto = new RegisterDto { Username = "existing", Password = "password" };
            
            var result = await _controller.Register(dto);
            
            Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
            _mockUsers.Verify(m => m.Add(It.IsAny<User>()), Times.Never);
        }
        
        // Login testing is harder because CreatePasswordHash generates random salt, 
        // and Login verifies it.
        // But since we can't easily inject the Salt into the Hash logic inside the controller (it's private void),
        // we can test the "Success" flow by creating a user with known hash/salt IF we could control the randomness.
        // OR we just rely on Register to create a valid user in our list, THEN try to login with same password.
        // Let's try to verify if Register creates a user that can bypass Login check.
        // The Controller's Hash logic is deterministic if Salt is known.
        // But the Salt is generated inside CreatePasswordHash.
        // Wait, the AuthController logic:
        // Register calls CreatePasswordHash -> sets user.PasswordHash/Salt.
        // Login calls VerifyPasswordHash using user.PasswordSalt.
        // Since both methods use same algorithm (HMACSHA512), if we register a user, we SHOULD be able to login as them.
        
        [Test]
        public async Task Login_ReturnsToken_WhenCredentialsAreValid()
        {
            // 1. Register a user (simulated by manually invoking logic or trusting the controller logic helper)
            // But we can't call Register and have it persist to _usersList automatically because Moq doesn't update the list
            // unless we setup Callback.
            // Let's setup Callback on Add.
            _mockUsers.Setup(m => m.Add(It.IsAny<User>())).Callback<User>(u => _usersList.Add(u));
            
            var registerDto = new RegisterDto { Username = "loginuser", Password = "password", RoleId = 1 };
            await _controller.Register(registerDto);
            
            // 2. Try Login
            var loginDto = new LoginDto { Username = "loginuser", Password = "password" };
            var result = await _controller.Login(loginDto);
            
            var okResult = result.Result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);
            var token = okResult.Value as string;
            Assert.That(token, Is.Not.Empty);
        }

        [Test]
        public async Task Login_ReturnsBadRequest_WhenPasswordIsWrong()
        {
             _mockUsers.Setup(m => m.Add(It.IsAny<User>())).Callback<User>(u => _usersList.Add(u));
            await _controller.Register(new RegisterDto { Username = "wrongpass", Password = "correct" });
            
            var result = await _controller.Login(new LoginDto { Username = "wrongpass", Password = "wrong" });
             Assert.That(result.Result, Is.InstanceOf<BadRequestObjectResult>());
        }
    }
}
