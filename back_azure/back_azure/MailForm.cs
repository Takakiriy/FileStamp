using System;
using io = System.IO;
using System.Threading.Tasks;
using job = Microsoft.Azure.WebJobs;  // nuget: Microsoft.Azure.WebJobs
using mvc = Microsoft.AspNetCore.Mvc;  // nuget: Microsoft.AspNetCore.Mvc
using httpx = Microsoft.Azure.WebJobs.Extensions.Http;  // nuget: Microsoft.Azure.WebJobs.Extensions.Http
using http = Microsoft.AspNetCore.Http;
using log = Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;  // nuget: Microsoft.Extensions.DependencyInjection
using Microsoft.Extensions.Logging;
using send = SendGrid;  // nuget: SendGrid
using mail = SendGrid.Helpers.Mail;
using SendGrid.Extensions.DependencyInjection;
using json = Newtonsoft.Json;

namespace Company.Function
{
    public static class MailForm
    {
        [job::FunctionName("MailForm_POST")]
        public static async Task<mvc::IActionResult> OnHttpPost(
            [job::HttpTrigger(httpx::AuthorizationLevel.Anonymous, "post", Route = "mailform")] http::HttpRequest req,
            log::ILogger log)
        {
            log.LogInformation($"C# HTTP trigger function MailForm_POST.");

            await Program.CheckRequestCount();
            var  requestBodyString = await new io::StreamReader(req.Body).ReadToEndAsync();
            dynamic requestBody = json::JsonConvert.DeserializeObject(requestBodyString);

            var services = ConfigureServices(new ServiceCollection()).BuildServiceProvider();
            var client = services.GetRequiredService<send::ISendGridClient>();
            var from = new mail::EmailAddress(Environment.GetEnvironmentVariable("SendGrid_SendFrom"),
                Environment.GetEnvironmentVariable("SendGrid_Sender"));
            var to = new mail::EmailAddress(Environment.GetEnvironmentVariable("SendGrid_SendTo"), "Customer Support");
            var reply = new mail::EmailAddress((string)requestBody.mailAddress, (string)requestBody.mailName);
            var msg = new mail::SendGridMessage
            {
                From = from,
                ReplyTo = reply,
                Subject = (string)requestBody.mailTitle +"("+ (string)requestBody.mailName +" "+ (string)requestBody.mailAddress +")"
            };
            msg.AddContent(send::MimeType.Text, (string)requestBody.mailContents);
            msg.AddTo(to);
            if (Environment.GetEnvironmentVariable("SendGrid_SandboxMode") == "true")
            {
                msg.MailSettings = new mail::MailSettings
                {
                    SandboxMode = new mail::SandboxMode
                    {
                        Enable = true
                    }
                };
            }
            log.LogInformation($"Reply to: {requestBody.mailAddress}");

            var response = await client.SendEmailAsync(msg).ConfigureAwait(false);
            log.LogInformation($"Response: {response.StatusCode}");

            return new mvc::OkObjectResult($"\"MailForm_POST: reply {requestBody.mailAddress} to {to.Email}\"");
        }

        private static IServiceCollection ConfigureServices(IServiceCollection services)
        {
            services.AddSendGrid(options => {
                options.ApiKey = Environment.GetEnvironmentVariable("SendGrid_API_Key");
            });
            return services;
        }
    }
}
