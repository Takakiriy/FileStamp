using System;
using io = System.IO;
using net = System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Xunit;
using Company.Function;
using System.Security.Claims;
using System.Collections.Generic;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;
using System.Threading.Tasks;
using http = System.Web.Http;
using System.Linq;
using Xunit.Abstractions;

namespace XUnit.Project.Orderers
{
    public class DisplayNameOrderer : ITestCollectionOrderer
    {
        public IEnumerable<ITestCollection> OrderTestCollections(
            IEnumerable<ITestCollection> testCollections) =>
            testCollections.OrderBy(collection => collection.DisplayName);
    }
}

namespace Functions.Tests
{
    public class S // Settings
    {
        public const string  TaroMailAddress = "taro.suzuki@example.com";
        public const string  JiroMailAddress = "jiro.suzuki@example.com";
        public const string  SaburoMailAddress = "saburo.suzuki@example.com";
        public const string  FileHashA = "aaaaaaaa4d875bcc80df5f50e0511cc73b1d7820a44f3a378a6660c9647ae69d";
        public const string  FileHashB = "bbbbbbbb98fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
    }

    [Collection("01-Signature")]
    public class TestOfSignature
    {
        [Fact]
        public async void TestOfPut()
        {
            await T.LoadApplicationSettings();

            await T.CallHttpPutMethod(S.FileHashA, S.TaroMailAddress);

            var response = await T.CallHttpGetMethod(S.FileHashA);
            dynamic signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);

            T.AssertEqual((string)signature.Signer, S.TaroMailAddress);
            T.MyAssertNow((string)signature.Date);
            T.AssertEqual((bool)signature.IsDeleted, false);
        }

        [Fact]
        public async void TestOfGet()
        {
            await T.LoadApplicationSettings();

            var response = await T.CallHttpGetMethod(S.FileHashA);
            dynamic signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);

            T.AssertEqual((string)signature.Signer, S.TaroMailAddress);
        }

        [Fact]
        public async void TestOfDelete()
        {
            await T.LoadApplicationSettings();

            await T.CallHttpDeleteMethod(S.FileHashA, S.TaroMailAddress);

            var response = await T.CallHttpGetMethod(S.FileHashA);
            dynamic signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);

            T.AssertEqual((string)signature.Signer, S.TaroMailAddress);
            T.MyAssertNow((string)signature.Date);
            T.AssertEqual((bool)signature.IsDeleted, true);
        }

        [Fact]
        public async void TestOfManyPutAndDelete()
        {
            await T.LoadApplicationSettings();

            await T.CallHttpPutMethod(S.FileHashA, S.TaroMailAddress);

            var response = await T.CallHttpGetMethod(S.FileHashA);
            dynamic signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);

            T.AssertEqual((string)signature.Signer, S.TaroMailAddress);
            T.MyAssertNow((string)signature.Date);
            T.AssertEqual((bool)signature.IsDeleted, false);

            await T.CallHttpDeleteMethod(S.FileHashA, S.TaroMailAddress);

            response = await T.CallHttpGetMethod(S.FileHashA);
            signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);

            T.AssertEqual((string)signature.Signer, S.TaroMailAddress);
            T.MyAssertNow((string)signature.Date);
            T.AssertEqual((bool)signature.IsDeleted, true);

            await T.CallHttpPutMethod(S.FileHashA, S.TaroMailAddress);

            response = await T.CallHttpGetMethod(S.FileHashA);
            signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);

            T.AssertEqual((string)signature.Signer, S.TaroMailAddress);
            T.MyAssertNow((string)signature.Date);
            T.AssertEqual((bool)signature.IsDeleted, false);

            await T.CallHttpDeleteMethod(S.FileHashA, S.TaroMailAddress);

            response = await T.CallHttpGetMethod(S.FileHashA);
            signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);

            T.AssertEqual((string)signature.Signer, S.TaroMailAddress);
            T.MyAssertNow((string)signature.Date);
            T.AssertEqual((bool)signature.IsDeleted, true);
        }

        [Fact]
        public async void TestOfPutFromEachUser()
        {
            await T.LoadApplicationSettings();

            await T.CallHttpPutMethod(S.FileHashB, S.SaburoMailAddress);
            await T.CallHttpPutMethod(S.FileHashB, S.JiroMailAddress);
            await T.CallHttpPutMethod(S.FileHashB, S.TaroMailAddress);

            var body = T.GetBody(await T.CallHttpGetMethod(S.FileHashB));
            dynamic signature;

            foreach(string mailAddress in new string[] {
                S.TaroMailAddress, S.JiroMailAddress, S.SaburoMailAddress })
            {
                signature = T.SearchOneSignature(body, mailAddress);

                T.AssertEqual((string)signature.Signer, mailAddress);
                T.MyAssertNow((string)signature.Date);
                T.AssertEqual((bool)signature.IsDeleted, false);
            }


            await T.CallHttpDeleteMethod(S.FileHashB, S.JiroMailAddress);
            signature = T.SearchOneSignature(T.GetBody(await T.CallHttpGetMethod(S.FileHashB)), S.TaroMailAddress);
            T.AssertEqual((bool)signature.IsDeleted, false);
            signature = T.SearchOneSignature(T.GetBody(await T.CallHttpGetMethod(S.FileHashB)), S.JiroMailAddress);
            T.AssertEqual((bool)signature.IsDeleted, true);
            signature = T.SearchOneSignature(T.GetBody(await T.CallHttpGetMethod(S.FileHashB)), S.SaburoMailAddress);
            T.AssertEqual((bool)signature.IsDeleted, false);
        }

        [Fact]
        public async void TestOfAuthenticationEmulated()
        {
            dynamic signature;
            await T.LoadApplicationSettings();

            var response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("put") },
                    },
                    "{\"fileHash\": \""+ S.FileHashA +"\"}"
                ),
                T.Logger,
                T.TaroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("put") },  // 最初に delete はできないため
                    },
                    "{\"fileHash\": \""+ S.FileHashA +"\"}"
                ),
                T.Logger,
                T.JiroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("delete") },
                    },
                    "{\"fileHash\": \""+ S.FileHashA +"\"}"
                ),
                T.Logger,
                T.JiroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("get") },
                    },
                    "{\"fileHash\": \""+ S.FileHashA +"\"}"
                ),
                T.Logger,
                T.TaroPrincipal);

            signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);
            T.AssertEqual((bool)signature.IsDeleted, false);
            signature = T.SearchOneSignature(T.GetBody(response), S.JiroMailAddress);
            T.AssertEqual((bool)signature.IsDeleted, true);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("delete") },
                    },
                    "{\"fileHash\": \""+ S.FileHashA +"\"}"
                ),
                T.Logger,
                T.TaroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("put") },
                    },
                    "{\"fileHash\": \""+ S.FileHashA +"\"}"
                ),
                T.Logger,
                T.JiroPrincipal);

            response = (OkObjectResult)await Signature.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{
                        { "method", new StringValues("get") },
                    },
                    "{\"fileHash\": \""+ S.FileHashA +"\"}"
                ),
                T.Logger,
                T.TaroPrincipal);

            signature = T.SearchOneSignature(T.GetBody(response), S.TaroMailAddress);
            T.AssertEqual((bool)signature.IsDeleted, true);
            signature = T.SearchOneSignature(T.GetBody(response), S.JiroMailAddress);
            T.AssertEqual((bool)signature.IsDeleted, false);
        }

        [Fact]
        public async void TestOfBadMethod()
        {
            await T.LoadApplicationSettings();
            var  exception = false;
            try {
                var response = (IActionResult)await Signature.OnHttpPost(
                    TestFactory.CreateHttpRequest(
                        new Dictionary<string, StringValues>{
                            { "method", new StringValues("unknown") },
                            { "mail", new StringValues(S.TaroMailAddress) },
                        },
                        "{\"fileHash\": \""+ S.FileHashA +"\"}"
                    ),
                    T.Logger,
                    T.NotAuthenticatedUserPrincipal);
            } catch (Exception) {
                exception = true;
            }
            T.AssertEqual(exception, true);
        }
    }

    [Collection("02-MailForm")]
    public class TestOfMailForm
    {
        [Fact]
        public async void TestOfPutToMailForm()
        {
            await T.LoadApplicationSettings();

            var response = (OkObjectResult)await MailForm.OnHttpPost(
                TestFactory.CreateHttpRequest(
                    new Dictionary<string, StringValues>{},
                    "{" +
                        "\"mailTitle\": \"TestOfPutToMailForm のテスト\"," +
                        "\"mailName\": \"鈴木 太郎\"," +
                        "\"mailAddress\": \"taro.suzuki@example.com\"," +
                        "\"mailContents\": \"高橋様\nお世話になっております。\"" +
                    "}"
                ),
                T.Logger);
        }
    }

    [Collection("99-RequestCount")]
    public class TestOfRequestCount
    {
        [Fact]
        public async void TestOfManyRequestCount()
        {
            await T.LoadApplicationSettings();
            var  maxRequestCountPerMinute = int.Parse(Environment.GetEnvironmentVariable("MaxRequestCountPerMinute"));
            var  exception = false;
            try {

                for (int i = 0;  i <= maxRequestCountPerMinute;  i += 1 ) {
                    await Program.CheckRequestCount();
                }
            } catch (http::HttpResponseException exc) {
                if (exc.Response.StatusCode == (net::HttpStatusCode)429) {
                    exception = true;
                }
            }
            T.AssertEqual(exception, true);
        }
    }

    public class T  // TestTools
    {
        // Logger
        public static readonly ILogger Logger = TestFactory.CreateLogger(LoggerTypes.List);

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

                identity.AddClaim(new Claim( ClaimTypes.Name, S.TaroMailAddress));
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

                identity.AddClaim(new Claim( ClaimTypes.Name, S.JiroMailAddress));
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
                        { "mail", new StringValues(S.TaroMailAddress) },
                    },
                    "{\"fileHash\": \""+ fileHash +"\"}"
                ),
                Logger,
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
                Logger,
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
                Logger,
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

        // LoadApplicationSettings()
        public static async Task  LoadApplicationSettings()
        {
            string requestBody = await new io::StreamReader("local.settings.json").ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            foreach (var property in data.Values) {
                foreach (var valueD in property) {
                    string key = property.Name;
                    string value = valueD.Value;
                    Environment.SetEnvironmentVariable(key, value);
                }
            }
        }
    }
}
