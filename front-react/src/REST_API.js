import axiosBase from 'axios';

class  REST_APIClass {
  constructor() {
    this.axios = axiosBase.create({
      baseURL: 'https://sagep-function-cs.azurewebsites.net',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      responseType: 'json'  
    });
  }

  async getTest() {
    return this.axios.get('/api/HttpTriggerCSharp1')
    .then( (response) => {
      console.log(response);
      return response.data;
    })
  }
}
const REST_API = new REST_APIClass()
export default REST_API;
