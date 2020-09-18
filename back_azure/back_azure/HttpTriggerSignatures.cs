using System;
using System.IO;
using System.Configuration;
using System.Collections.Generic;
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
        public const string CosmosDBContainerID = "StampContainer";
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
            var  mailAddress = getMailAddress();
            var  requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);

            // await Program.Main();

            return new OkObjectResult($"\"{method}: {data.fileHash}, {mailAddress}\"");
        }

        private static string getMailAddress() {
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
    }

    public class Program
    {
        private CosmosClient cosmosClient;
        private Database database;
        private Container container;
        public static HttpRequest req; 
        public static ILogger log; 
        public static ClaimsPrincipal claimsPrincipal;


        // Main()
        public static async Task  Main() {
            try {
                Console.WriteLine("Beginning operations...\n");
                Program p = new Program();

                await p.GetStartedDemoAsync();
            }
            catch (CosmosException de) {
                Exception baseException = de.GetBaseException();
                Console.WriteLine("{0} error occurred: {1}", de.StatusCode, de);
            }
            catch (Exception e) {
                Console.WriteLine("Error: {0}", e);
            }
            finally {
                Console.WriteLine("End of demo.");
            }
        }


        // GetStartedDemoAsync()
        public async Task  GetStartedDemoAsync()
        {
            this.cosmosClient = new CosmosClient(Settings.CosmosDBEndpointUrl, Settings.CosmosDBPrimaryKey);
            await this.CreateDatabaseAsync();
            await this.CreateContainerAsync();
            await this.AddItemsToContainerAsync();
            await this.QueryItemsAsync();
        }


        // CreateDatabaseAsync()
        // データベースのハンドルを取得する。 ただし、もし、データベースが無かったら追加する。
        private async Task  CreateDatabaseAsync() {
            this.database = await this.cosmosClient.CreateDatabaseIfNotExistsAsync(Settings.CosmosDBDatabaseID);
            Console.WriteLine("Created Database: {0}\n", this.database.Id);
        }


        // CreateContainerAsync()
        // コンテナーのハンドルを取得する。 ただし、もし、コンテナーが無かったら追加する。
        private async Task  CreateContainerAsync() {
            this.container = await this.database.CreateContainerIfNotExistsAsync(Settings.CosmosDBContainerID, "/LastName");
            Console.WriteLine("Created Container: {0}\n", this.container.Id);
        }


        // AddItemsToContainerAsync()
        // アイテムを追加する
        private async Task  AddItemsToContainerAsync() {

            // andersenStamp = ...
            Stamp  andersenStamp = new Stamp {
                Id = "Andersen.1",
                LastName = "Andersen",
                Parents = new Parent[] {
                    new Parent { FirstName = "Thomas" },
                    new Parent { FirstName = "Mary Kay" }
                },
                Children = new Child[] {
                    new Child
                    {
                        FirstName = "Henriette Thaulow",
                        Gender = "female",
                        Grade = 5,
                        Pets = new Pet[]
                        {
                            new Pet { GivenName = "Fluffy" }
                        }
                    }
                },
                Address = new Address { State = "WA", County = "King", City = "Seattle" },
                IsRegistered = false
            };

            try {
                // Create an item in the container representing the Andersen Stamp. Note we provide the value of the partition key for this item, which is "Andersen".

                // CreateItemAsync()
                ItemResponse<Stamp> andersenStampResponse =
                    await this.container.CreateItemAsync<Stamp>(
                        andersenStamp,
                        new PartitionKey( andersenStamp.LastName )
                    );

                // Note that after creating the item, we can access the body of the item with the Resource property of the ItemResponse. We can also access the RequestCharge property to see the amount of RUs consumed on this request.
                Console.WriteLine("Created item in database with id: {0} Operation consumed {1} RUs.\n", andersenStampResponse.Resource.Id, andersenStampResponse.RequestCharge);
            }
            catch (CosmosException ex) when (ex.StatusCode == HttpStatusCode.Conflict)
            {
                Console.WriteLine("Item in database with id: {0} already exists\n", andersenStamp.Id);                
            }
        }


        // QueryItemsAsync()
        private async Task QueryItemsAsync()
        {
            // sqlQueryText = ...
            var sqlQueryText = "SELECT * FROM c WHERE c.LastName = 'Andersen'";
            Console.WriteLine("Running query: {0}\n", sqlQueryText);
            QueryDefinition queryDefinition = new QueryDefinition(sqlQueryText);

            // GetItemQueryIterator()
            FeedIterator<Stamp> queryResultSetIterator = this.container.GetItemQueryIterator<Stamp>(queryDefinition);
            List<Stamp> families = new List<Stamp>();

            while (queryResultSetIterator.HasMoreResults)
            {
                // ReadNextAsync()
                FeedResponse<Stamp> currentResultSet = await queryResultSetIterator.ReadNextAsync();
                foreach (Stamp Stamp in currentResultSet) {

                    families.Add(Stamp);
                    Console.WriteLine("\tRead {0}\n", Stamp);
                }
            }
        }


        // DeleteDatabaseAndCleanupAsync()
        private async Task  DeleteDatabaseAndCleanupAsync()
        {
            // DeleteAsync()
            DatabaseResponse databaseResourceResponse = await this.database.DeleteAsync();
            // Also valid: await this.cosmosClient.Databases["StampDatabase"].DeleteAsync();

            Console.WriteLine("Deleted Database: {0}\n", Settings.CosmosDBDatabaseID);

            //Dispose of CosmosClient
            this.cosmosClient.Dispose();
        }
    }
}
