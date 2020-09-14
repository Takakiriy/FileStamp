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
    this.token = null;
    this.defaultAxiosOptions = {};
  }

  async getTest() {
    return this.axios.get('/api/HttpTriggerCSharp1?name=86', this.defaultAxiosOptions)
    .then( (response) => {
      return response.data;
    })
  }

  async getToken() {
    const front_end_base = window.location.protocol +"//"+ window.location.hostname;
    if (window.location.hostname.indexOf('localhost') >= 0) {
      return;
    }

    return this.axios.get(front_end_base + '/.auth/me')
    .then( (response) => {
      this.token = response.data[0].access_token;
      this.defaultAxiosOptions = {
        headers: {
          Authorization: `Bearer ${this.token}`,
        }
      };
      return response.data;
    })
    .catch( (err) => {
      window.location.reload();
    })
  }

  async putFileHashSignatures(fileHash) {
    return this.axios.get('/api/HttpTriggerCSharp1?name=' + fileHash, this.defaultAxiosOptions)
    .then( (response) => {
      return response.data;
    })
  }
}
const REST_API = new REST_APIClass()
export default REST_API;
