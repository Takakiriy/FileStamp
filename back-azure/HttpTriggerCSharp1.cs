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

namespace Company.Function
{
    public static class Settings {
        public const string CosmosDBEndpointUrl = "https://sagepcosmosdb1.documents.azure.com:443/";
        public const string CosmosDBPrimaryKey = "vPPTcPWGrmCCEkPLjhcLCU9x2nTuaYqlPdNJtFMxudkgZaW9YzL9kMlJZETrq5PSCXx3wINzlc7LxLL6zBFFIQ==";
        public const string CosmosDBDatabaseID = "StampDatabase";
        public const string CosmosDBContainerID = "StampContainer";
    }
        
    public static class HttpTriggerCSharp1
    {
        [FunctionName("HttpTriggerCSharp1")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", "post", Route = null)] HttpRequest req,
            ILogger log)
        {
            await Program.Main();

            log.LogInformation("C# HTTP trigger function processed a request.");

            string name = req.Query["name"];

            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic data = JsonConvert.DeserializeObject(requestBody);
            name = name ?? data?.name;

            string responseMessage = string.IsNullOrEmpty(name)
                ? "\"This HTTP triggered function executed successfully. Pass a name in the query string or in the request body for a personalized response.\""
                : $"\"Hello, {name}. This HTTP triggered function executed successfully.\"";

            return new OkObjectResult(responseMessage);
        }
    }

    public class Program
    {
        private CosmosClient cosmosClient;
        private Database database;
        private Container container;


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
