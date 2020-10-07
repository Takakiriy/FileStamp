import axiosBase from 'axios';
import { MyContextValue } from './MyContext';

class  REST_APIClass {
  constructor() {
    this.axios = axiosBase.create({
      baseURL: 'https://sagep-app-function-v004.azurewebsites.net',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      responseType: 'json'  
    });
    this.token = null;
    this.testQueryParameter = "";
    this.defaultAxiosOptions = {};
  }

  async getToken() {
    const front_end_base = window.location.protocol +"//"+ window.location.hostname;
    if (MyContextValue.isTestMode) {
      this.testQueryParameter = "&mail=" + MyContextValue.userMailAddress;
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
        setTimeout( () => {
          window.location.reload();
        }, 2000 );
      });
  }

  async getTest() {
    return this.axios.post('/api/signatures?method=get' + this.testQueryParameter,
      {fileHash: "123"}, this.defaultAxiosOptions)
    .then( (response) => {
      return response.data;
    })
  }

  async putFileHashSignatures(fileHash) {
    return this.axios.post('/api/signatures?method=put' + this.testQueryParameter,
      {fileHash}, this.defaultAxiosOptions)
    .then( (response) => {
      return response.data;
    })
  }

  async getFileHashSignatures(fileHash) {
    return this.axios.post('/api/signatures?method=get' + this.testQueryParameter,
      {fileHash}, this.defaultAxiosOptions)
    .then( (response) => {
      return response.data;
    })
  }

  async deleteFileHashSignatures(fileHash) {
    return this.axios.post('/api/signatures?method=delete' + this.testQueryParameter,
      {fileHash}, this.defaultAxiosOptions)
    .then( (response) => {
      return response.data;
    })
  }

  async postFromMailForm(mailTitle, mailName, mailAddress, mailContents) {
    return this.axios.post('/api/mailform?' + this.testQueryParameter.substr(1),
      {
        mailTitle,
        mailName,
        mailAddress,
        mailContents
      }, this.defaultAxiosOptions)
    .then( (response) => {
      return response.data;
    })
  }
}
const REST_API = new REST_APIClass()
export default REST_API;
