using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Xunit;
using Company.Function;
using System.Security.Claims;
using System.Collections.Generic;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace Functions.Tests
{
    public class TestOfSignature
    {
        private const string  taroMailAddress = "taro.suzuki@example.com";
        private const string  jiroMailAddress = "jiro.suzuki@example.com";
        private const string  saburoMailAddress = "saburo.suzuki@example.com";
        private const string  fileHashA = "aaaaaaaa4d875bcc80df5f50e0511cc73b1d7820a44f3a378a6660c9647ae69d";
        private const string  fileHashB = "bbbbbbbb98fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";

        [Fact]
        public async void TestOfPut()
        {
            await CallHttpPutMethod(fileHashA, taroMailAddress);

            var response = await CallHttpGetMethod(fileHashA);
            dynamic signature = SearchOneSignature(GetBody(response), taroMailAddress);

            AssertEqual((string)signature.Signer, taroMailAddress);
            MyAssertNow((string)signature.Date);
            AssertEqual((bool)signature.IsDeleted, false);
        }

        [Fact]
        public async void TestOfGet()
        {
            var response = await CallHttpGetMethod(fileHashA);
            dynamic signature = SearchOneSignature(GetBody(response), taroMailAddress);

            AssertEqual((string)signature.Signer, taroMailAddress);
        }

        [Fact]
        public async void TestOfDelete()
        {
            await CallHttpDeleteMethod(fileHashA, taroMailAddress);

            var response = await CallHttpGetMethod(fileHashA);
            dynamic signature = SearchOneSignature(GetBody(response), taroMailAddress);

            AssertEqual((string)signature.Signer, taroMailAddress);
            MyAssertNow((string)signature.Date);
            AssertEqual((bool)signature.IsDeleted, true);
        }

        [Fact]
        public async void TestOfManyPutAndDelete()
        {
            await CallHttpPutMethod(fileHashA, taroMailAddress);

            var response = await CallHttpGetMethod(fileHashA);
            dynamic signature = SearchOneSignature(GetBody(response), taroMailAddress);

            AssertEqual((string)signature.Signer, taroMailAddress);
            MyAssertNow((string)signature.Date);
            AssertEqual((bool)signature.IsDeleted, false);

            await CallHttpDeleteMethod(fileHashA, taroMailAddress);

            response = await CallHttpGetMethod(fileHashA);
            signature = SearchOneSignature(GetBody(response), taroMailAddress);

            AssertEqual((string)signature.Signer, taroMailAddress);
            MyAssertNow((string)signature.Date);
            AssertEqual((bool)signature.IsDeleted, true);

            await CallHttpPutMethod(fileHashA, taroMailAddress);

            response = await CallHttpGetMethod(fileHashA);
            signature = SearchOneSignature(GetBody(response), taroMailAddress);

            AssertEqual((string)signature.Signer, taroMailAddress);
            MyAssertNow((string)signature.Date);
            AssertEqual((bool)signature.IsDeleted, false);

            await CallHttpDeleteMethod(fileHashA, taroMailAddress);

            response = await CallHttpGetMethod(fileHashA);
            signature = SearchOneSignature(GetBody(response), taroMailAddress);

            AssertEqual((string)signature.Signer, taroMailAddress);
            MyAssertNow((string)signature.Date);
            AssertEqual((bool)signature.IsDeleted, true);
        }

        [Fact]
        public async void TestOfPutFromEachUser()
        {
            await CallHttpPutMethod(fileHashB, saburoMailAddress);
            await CallHttpPutMethod(fileHashB, jiroMailAddress);
            await CallHttpPutMethod(fileHashB, taroMailAddress);

            var body = GetBody(await CallHttpGetMethod(fileHashB));
            dynamic signature;

            foreach(string mailAddress in new string[] {
                taroMailAddress, jiroMailAddress, saburoMailAddress })
            {
                signature = SearchOneSignature(body, mailAddress);

                AssertEqual((string)signature.Signer, mailAddress);
                MyAssertNow((string)signature.Date);
                AssertEqual((bool)signature.IsDeleted, false);
            }


            await CallHttpDeleteMethod(fileHashB, jiroMailAddress);
            signature = SearchOneSignature(GetBody(await CallHttpGetMethod(fileHashB)), taroMailAddress);
            AssertEqual((bool)signature.IsDeleted, false);
            signature = SearchOneSignature(GetBody(await CallHttpGetMethod(fileHashB)), jiroMailAddress);
            AssertEqual((bool)signature.IsDeleted, true);
            signature = SearchOneSignature(GetBody(await CallHttpGetMethod(fileHashB)), saburoMailAddress);
            AssertEqual((bool)signature.IsDeleted, false);
        }

        [Fact]
        public async void TestOfAuthenticationEmulated()
        {
            dynamic signature;

            var response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("put") },
                    },
                    "{\"fileHash\": \""+ fileHashA +"\"}"
                ),
                logger,
                TaroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("put") },  // 最初に delete はできないため
                    },
                    "{\"fileHash\": \""+ fileHashA +"\"}"
                ),
                logger,
                JiroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("delete") },
                    },
                    "{\"fileHash\": \""+ fileHashA +"\"}"
                ),
                logger,
                JiroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("get") },
                    },
                    "{\"fileHash\": \""+ fileHashA +"\"}"
                ),
                logger,
                TaroPrincipal);

            signature = SearchOneSignature(GetBody(response), taroMailAddress);
            AssertEqual((bool)signature.IsDeleted, false);
            signature = SearchOneSignature(GetBody(response), jiroMailAddress);
            AssertEqual((bool)signature.IsDeleted, true);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("delete") },
                    },
                    "{\"fileHash\": \""+ fileHashA +"\"}"
                ),
                logger,
                TaroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("put") },
                    },
                    "{\"fileHash\": \""+ fileHashA +"\"}"
                ),
                logger,
                JiroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("get") },
                    },
                    "{\"fileHash\": \""+ fileHashA +"\"}"
                ),
                logger,
                TaroPrincipal);

            signature = SearchOneSignature(GetBody(response), taroMailAddress);
            AssertEqual((bool)signature.IsDeleted, true);
            signature = SearchOneSignature(GetBody(response), jiroMailAddress);
            AssertEqual((bool)signature.IsDeleted, false);
        }

        [Fact]
        public async void TestOfBadMethod()
        {
            var  exception = false;
            try {
                var response = (IActionResult)await Signature.OnHttpPost(
                    TestFactory.CreateHttpRequest(
                        new Dictionary<string, StringValues>{
                            { "method", new StringValues("unknown") },
                            { "mail", new StringValues(taroMailAddress) },
                        },
                        "{\"fileHash\": \""+ fileHashA +"\"}"
                    ),
                    logger,
                    NotAuthenticatedUserPrincipal);
            } catch (Exception) {
                exception = true;
            }
            AssertEqual(exception, true);
        }

        // logger
        private static readonly ILogger logger = TestFactory.CreateLogger(LoggerTypes.List);

        // NotAuthenticatedUserPrincipal
        public static ClaimsPrincipal  NotAuthenticatedUserPrincipal
        {
            get {
                var  principal = new ClaimsPrincipal();
                var  identity = new ClaimsIdentity();
                principal.AddIdentity(identity);

                return  principal;
            }
        }

        // TaroPrincipal
        public static ClaimsPrincipal  TaroPrincipal
        {
            get {
                // https://stackoverflow.com/questions/20383955/how-to-add-claims-in-asp-net-identity
                var  principal = new ClaimsPrincipal();
                var  identity = new ClaimsIdentity();
                principal.AddIdentity(identity);

                identity.AddClaim(new Claim( ClaimTypes.Name, taroMailAddress));
                return  principal;
            }
        }

        // JiroPrincipal
        public static ClaimsPrincipal  JiroPrincipal
        {
            get {
                // https://stackoverflow.com/questions/20383955/how-to-add-claims-in-asp-net-identity
                var  principal = new ClaimsPrincipal();
                var  identity = new ClaimsIdentity();
                principal.AddIdentity(identity);

                identity.AddClaim(new Claim( ClaimTypes.Name, jiroMailAddress));
                return  principal;
            }
        }

        // CallHttpGetMethod()
        public static async Task<OkObjectResult>  CallHttpGetMethod(string fileHash)
        {
            var response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("get") },
                        { "mail", new StringValues(taroMailAddress) },
                    },
                    "{\"fileHash\": \""+ fileHash +"\"}"
                ),
                logger,
                NotAuthenticatedUserPrincipal);
            return response;
        }

        // CallHttpPutMethod()
        public static async Task<OkObjectResult>  CallHttpPutMethod(string fileHash, string signer)
        {
            var response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("put") },
                        { "mail", new StringValues(signer) },
                    },
                    "{\"fileHash\": \""+ fileHash +"\"}"
                ),
                logger,
                NotAuthenticatedUserPrincipal);
            return response;
        }

        // CallHttpDeleteMethod()
        public static async Task<OkObjectResult>  CallHttpDeleteMethod(string fileHash, string signer)
        {
            var response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("delete") },
                        { "mail", new StringValues(signer) },
                    },
                    "{\"fileHash\": \""+ fileHash +"\"}"
                ),
                logger,
                NotAuthenticatedUserPrincipal);
            return response;
        }

        // GetBody()
        public static dynamic  GetBody(OkObjectResult response)
        {
            var  responseJSON = response.Value.ToString();
            return JsonConvert.DeserializeObject(responseJSON);
        }

        // SearchOneSignature()
         public static dynamic  SearchOneSignature(dynamic body, string signer)
         {
             foreach (var signature in body.Signatures) {
                 if (signature.Signer == signer) {
                     return  signature;
                 }
             }
             return null;
         }

        // AssertEqual()
        public static void AssertEqual<T>(T actual, T expected)
        {
            Assert.Equal(expected, actual);
        }

        // MyAssertNow()
        public static void  MyAssertNow(string actualDate)
        {
            var expected = DateTime.UtcNow;
            var actual = DateTime.Parse(actualDate);
            Assert.True(expected >= actual);
            TimeSpan  diff = expected - actual;
            Assert.True(diff.TotalMinutes <= 1);
        }
    }
}
