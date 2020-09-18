using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Xunit;
using Company.Function;
using System.Security.Claims;

namespace Functions.Tests
{
    public class TestOfSignature
    {
        [Fact]
        public async void TestOfTest()
        {
            var  exception = false;
            try {
                var response = (IActionResult)await Signature.OnHttpPost(
                    TestFactory.CreateHttpRequest("", ""),
                    logger,
                    new ClaimsPrincipal());
            } catch (Exception) {
                exception = true;
            }
            AssertEqual(exception, true);
        }

        private readonly ILogger logger = TestFactory.CreateLogger(LoggerTypes.List);

        public void AssertEqual<T>(T actual, T expected)
        {
            Assert.Equal(expected, actual);
        }
    }
}
