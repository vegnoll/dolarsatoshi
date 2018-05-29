const LOCALBITCOINSENDPOINT = 'https://cors-anywhere.herokuapp.com/https://localbitcoins.com';
const COINMARKETCAPENDPOINT = 'https://api.coinmarketcap.com/v1';

export const localBitcoins = async () => {
  const opt = {
    method: 'GET',
    mode: 'cors',
    headers:{
      'Origin': '*',
    },
    body:null,
  };
  const response = await fetch(`${LOCALBITCOINSENDPOINT}/sell-bitcoins-online/vef/.json`, opt);
  if (response.ok) {
    return await response.json();
  }

  return { "error": true };
};

export const coinMarketCap = async () => {
  const response = await fetch(`${COINMARKETCAPENDPOINT}/ticker/bitcoin/?convert=USD`);

  return await response.json();
};
