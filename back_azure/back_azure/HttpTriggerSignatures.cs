using System;
using System.IO;
using System.Threading.Tasks;
using System.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Azure.Cosmos;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System.Security.Claims;

namespace Company.Function
{
    public static class Settings {
        public const string CosmosDBEndpointUrl = "https://sagepcosmosdb1.documents.azure.com:443/";
        public const string CosmosDBPrimaryKey = "vPPTcPWGrmCCEkPLjhcLCU9x2nTuaYqlPdNJtFMxudkgZaW9YzL9kMlJZETrq5PSCXx3wINzlc7LxLL6zBFFIQ==";
        public const string CosmosDBDatabaseID = "StampDatabase";
        public const string ExampleCosmosDBContainerID = "StampContainer";
        public const string CosmosDBContainerID = "Signature";
    }
        
    public static class Signature
    {
        [FunctionName("Signatures_POST")]
        public static async Task<IActionResult> OnHttpPost(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "signatures")] HttpRequest req,
            ILogger log,
            ClaimsPrincipal claimsPrincipal)
        {
            // HTTPS GET メソッドや DELETE メソッドを使わない理由は、
            // ・暗号化されることが確実ではない URL にはファイルのハッシュ値を含められないこと
            //   https://hogem.hatenablog.com/entry/20100307/1267977441
            //   https://worklog.be/archives/3398
            // ・ファイルのハッシュ値が漏洩して他の人が署名の状況を確認できることがないようにすること
            // ・axios の get では body が送れないこと
            // ・HTTP GET の body は（古い仕様では）無視されること
            //   https://stackoverflow.com/questions/978061/http-get-with-request-body
            // ・HTTP DELETE で body に何か入れると、Chrome か Azure App Service が応答しなくなること
            string method = req.Query["method"];

            log.LogInformation($"C# HTTP trigger function processed a request {method}.");
            Program.req = req;
            Program.log = log;
            Program.claimsPrincipal = claimsPrincipal;
            var  mailAddress = Program.GetMailAddress();
            var  requestBodyString = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic requestBody = JsonConvert.DeserializeObject(requestBodyString);

            if (method == "put")
            {
                var  args = new FileStampArgument();
                args.FileHash = requestBody.fileHash;
                args.Signer = mailAddress;
                args.Date = Program.GetNowUTC();

                await Program.AddSignature(args);
                return new OkObjectResult($"\"{method}: {requestBody.fileHash}, {mailAddress}\"");
            }
            else if (method == "get")
            {
                var responseBody = await Program.GetSignatures((string)requestBody.fileHash);
                return new OkObjectResult(responseBody);
            }
            else if (method == "delete")
            {
                var  args = new FileStampArgument();
                args.FileHash = requestBody.fileHash;
                args.Signer = mailAddress;
                args.Date = Program.GetNowUTC();

                await Program.RemoveSignature(args);
                return new OkObjectResult($"\"{method}: {requestBody.fileHash}, {mailAddress}\"");
            }
            else
            {
                throw  new System.InvalidOperationException( "not found the specified method" );
            }
        }
    }

    public class Program
    {
        // AddSignature()
        public static async Task  AddSignature(FileStampArgument args) {
            var  db = new FileStampDataBase();
            try {
                await db.SetUp();

                var data = await db.GetSignature(args.FileHash);
                if (data == null) {
                    data = new FileStampData();
                    data.id = args.FileHash;
                    data.Signatures = new SignatureData[1];
                    data.Signatures[0] = new SignatureData(args);

                    await db.PostSignature(data);
                } else {
                    SignatureData mySignature = null;
                    foreach (var signature in data.Signatures) {
                        if (signature.Signer == args.Signer) {
                            mySignature = signature;
                        }
                    }

                    if (mySignature == null) {
                        mySignature = new SignatureData(args);
                        var array = data.Signatures;
                        Array.Resize(ref array, array.Length + 1);
                        data.Signatures = array;
                        data.Signatures[array.Length - 1] = mySignature;
                    } else {
                        mySignature.IsDeleted = false;
                        mySignature.Date = args.Date;
                    }

                    await db.PutSignature(data);
                }

                // log
                var json = JsonConvert.SerializeObject(args, Formatting.Indented);
                log.LogInformation($"Success to add: ${json}");
            }
            catch (CosmosException de) {
                Exception baseException = de.GetBaseException();
                log.LogInformation("{0} error occurred: {1}", de.StatusCode, de);
                throw de;
            }
            catch (Exception e) {
                log.LogInformation("Success {0}", e);
                throw e;
            }
            finally {
                db.Dispose();
            }
        }


        // RemoveSignature()
        public static async Task  RemoveSignature(FileStampArgument args) {
            try {
                var  db = new FileStampDataBase();
                await db.SetUp();

                var data = await db.GetSignature(args.FileHash);
                if (data == null) {
                    Program.log.LogInformation($"No record WHERE fileHash={args.FileHash}");
                    return; // No error
                }
                var isFound = false;
                foreach (var signature in data.Signatures) {
                    if (signature.Signer == args.Signer) {

                        signature.IsDeleted = true;
                        signature.Date = args.Date;
                        isFound = true;
                    }
                }
                if (!isFound) {
                    Program.log.LogInformation($"Not found signature of {args.Signer}");
                    return; // No error
                }

                await db.PutSignature(data);

                // log
                var json = JsonConvert.SerializeObject(args, Formatting.Indented);
                log.LogInformation($"Success to remove: ${json}");
            }
            catch (CosmosException de) {
                Exception baseException = de.GetBaseException();
                log.LogInformation("{0} error occurred: {1}", de.StatusCode, de);
                throw de;
            }
            catch (Exception e) {
                log.LogInformation("{0}", e);
                throw e;
            }
            finally {
            }
        }


        // GetSignatures()
        public static async Task<string>  GetSignatures(string fileHash) {
            var  db = new FileStampDataBase();
            await db.SetUp();

            var data = await db.GetSignature(fileHash);
            if (data != null) {
                return  JsonConvert.SerializeObject(data);
            } else {
                return  "{\"id\":\""+ fileHash +"\", \"Signatures\":[]}";
            }
        }


        // GetMailAddress()
        public static string GetMailAddress() {
            var  mailAddress = "";
            var  authorizedMailAddress = Program.claimsPrincipal.Identity.Name;
            var  testMailAddress = Program.req.Query["mail"].ToString();

            var  isTestMode = (authorizedMailAddress == null  &&  testMailAddress.EndsWith("@example.com"));
            if (isTestMode) {
                mailAddress = testMailAddress;
            } else {
                mailAddress = authorizedMailAddress;
            }
            return  mailAddress;
        }


        // GetNowUTC()
        public static string  GetNowUTC() {
            return  DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm:ss");
        }

        public static HttpRequest req; 
        public static ILogger log; 
        public static ClaimsPrincipal claimsPrincipal;
    }


    public class  FileStampDataBase
    {
        // SetUp()
        public async Task  SetUp()
        {
            this.cosmosClient = new CosmosClient(Settings.CosmosDBEndpointUrl, Settings.CosmosDBPrimaryKey);
            this.database = await this.cosmosClient.CreateDatabaseIfNotExistsAsync(Settings.CosmosDBDatabaseID);
            this.container = await this.database.CreateContainerIfNotExistsAsync(Settings.CosmosDBContainerID,
                "/id");
        }


        // Dispose()
        public void  Dispose()
        {
            if (this.cosmosClient != null) {
                this.cosmosClient.Dispose();
            }
        }


        // PostSignature()
        public async Task  PostSignature(FileStampData data)
        {
            try {
                // CreateItemAsync()
                ItemResponse<FileStampData> andersenStampResponse =
                    await this.container.CreateItemAsync<FileStampData>(
                        data,
                        new PartitionKey( data.id )
                    );
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
            {
                Program.log.LogInformation($"CosmosException {ex}.");
                throw ex;
            }
        }


        // GetSignature()
        public async Task<FileStampData>  GetSignature(string fileHash)
        {
            var sqlQueryText = $"SELECT * FROM c WHERE c.id = '{fileHash}'";
            QueryDefinition queryDefinition = new QueryDefinition(sqlQueryText);

            // data = GetItemQueryIterator(), ReadNextAsync()
            FileStampData  data = null;
            FeedIterator<FileStampData>  iterator = this.container.GetItemQueryIterator<FileStampData>(queryDefinition);
            while (iterator.HasMoreResults) {  // Iterate physical partitions
                FeedResponse<FileStampData>  records = await iterator.ReadNextAsync();
                foreach (FileStampData record  in  records) {  //Iterate logical partitions

                    data = record;
                    break;
                }
            }
            return data;
        }


        // PutSignature()
        public async Task  PutSignature(FileStampData data)
        {
            try {
                // CreateItemAsync()
                ItemResponse<FileStampData> andersenStampResponse =
                    await this.container.UpsertItemAsync<FileStampData>(
                        data,
                        new PartitionKey( data.id )
                    );
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
            {
                Program.log.LogInformation($"CosmosException {ex}.");
                throw ex;
            }
        }

        private CosmosClient cosmosClient;
        private Database database;
        private Container container;
        public static HttpRequest req;
    }

    public class  FileStampArgument
    {
        public string FileHash;
        public string Signer;
        public string Date;
    }

    public class  FileStampData
    {
        public string id { get; set; }  // FileHash
        public SignatureData[] Signatures { get; set; }
    }

    public class  SignatureData
    {
        public string Signer { get; set; }  // e-mail
        public string Date { get; set; }
        public Boolean IsDeleted { get; set; }

        public SignatureData()
        {
        }

        public SignatureData(FileStampArgument args)
        {
            this.Signer = args.Signer;
            this.Date = args.Date;
            this.IsDeleted = false;
        }
    }
}
