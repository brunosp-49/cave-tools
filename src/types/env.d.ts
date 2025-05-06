declare module '@env' {
    export const SECRET_KEY: string;
  }
  
  declare module 'crypto-js' {
    const CryptoJS: any;
    export default CryptoJS;
  }
  