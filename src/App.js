import React, { Component } from 'react';
import { coinMarketCap, localBitcoins } from './api';
import FontAwesome from 'react-fontawesome';
import currencyFormatter from 'currency-formatter';
import outliers from 'outliers';
import version from './versions/current.json';
import logo from './satoshi.jpg';
import ipfs from './ipfs-logo-sm.png';
import './App.css';

const SATTOTALUNITS = 100000000;

class App extends Component {
  state = {
    btcPriceInVef: null,
    btcPriceInUsd: null,
    localbitcoinNumPrices: 20,
    randomVefNum: 150000,
    usdQty: '',
    vefQty: '',
    satQty: '',
    disabled: true
  };

  componentDidMount() {
    this.intervalBtcId = setInterval(() => this.getBtcPriceInVef(), 600000);
    this.intervalUsdId = setInterval(() => this.getBtcPriceInUsd(), 600000);
    this.getBtcPriceInVef();
    this.getBtcPriceInUsd();
  }

  async getBtcPriceInVef() {
    const prices = await localBitcoins();
    if (!prices.error) {
      const dataset = [];
      let totalPrice = 0;
      let j = 0;
      for (let i = 0; i < this.state.localbitcoinNumPrices; i++) {
        // solo obtenemos las muestras si son transferencias bancarias e ignoramos
        // las ventas de cupones
        const bankNameFlag = /cup(o|ó)n/i.test(prices.data.ad_list[i].data.bank_name);
        const msgFlag = /cup(o|ó)n/i.test(prices.data.ad_list[i].data.bank_name);
        if (
          (prices.data.ad_list[i].data.online_provider === 'SPECIFIC_BANK'
          || prices.data.ad_list[i].data.online_provider === 'NATIONAL_BANK')
          && !bankNameFlag
          && !msgFlag
        ) {
          dataset.push(parseInt(prices.data.ad_list[i].data.temp_price, 10));
        }
      }
      // eliminamos los valores atipicos de la muestra
      const cleanDataset = dataset.filter(outliers());
      cleanDataset.forEach(sellPrice => {
        totalPrice += sellPrice;
        j++;
      });
      this.setState({ btcPriceInVef: totalPrice / j, disabled: '' });
    }
  }

  async getBtcPriceInUsd() {
    const data = await coinMarketCap();
    this.setState({ btcPriceInUsd: data[0].price_usd });
  }

  getBtcPriceInVefFmt() {
    if (this.state.btcPriceInVef) {
      return currencyFormatter.format(this.state.btcPriceInVef, { code: 'VEF' });
    } else {
      return null;
    }
  }

  getUsdPriceInVef() {
    if (this.state.btcPriceInVef) {
      return this.state.btcPriceInVef / this.state.btcPriceInUsd;
    } else {
      return null;
    }
  }

  getSatPrice(btcPrice) {
    if (btcPrice) {
      return btcPrice / SATTOTALUNITS;
    } else {
      return null;
    }
  }

  getUsdPriceInVefFmt() {
    if (this.state.btcPriceInVef) {
      return currencyFormatter.format(this.getUsdPriceInVef(), { code: 'VEF' });
    } else {
      return <FontAwesome name="asterisk" spin />;
    }
  }

  getSatPriceInVefFmt() {
    if (this.state.btcPriceInVef) {
      return currencyFormatter.format(this.getSatPrice(this.state.btcPriceInVef), { code: 'VEF' })
    } else {
      return <FontAwesome name="asterisk" spin />;
    }
  }

  convertSatToBtc(sats) {
    const price = sats / SATTOTALUNITS;
    return price.toFixed(8);
  }

  convertSatToVef(sats) {
    const vef = sats * this.getSatPrice(this.state.btcPriceInVef);

    return parseInt(vef, 10);
  }

  convertSatToUsd(sats) {
    return sats * this.getSatPrice(this.state.btcPriceInUsd);
  }

  convertVefToBtc(vef) {
    const price = vef / this.state.btcPriceInVef;
    return price.toFixed(8);
  }

  convertToSat(qty, btcPrice) {
    return Math.round(qty / this.getSatPrice(btcPrice));
  }

  convertVefToUsd(vef) {
    return vef / this.getUsdPriceInVef();
  }

  convertUsdToVef(usd) {
    return usd * this.getUsdPriceInVef();
  }

  onSatInputChange(event) {
    const re = /^[0-9\b]+$/;
    if (event.target.value === '' || re.test(event.target.value)) {
      const usdQty = this.convertSatToUsd(event.target.value);
      const vefQty = this.convertSatToVef(event.target.value);
      this.setState({ usdQty, vefQty, satQty: event.target.value });
    }
  }

  onVefInputChange(event) {
    const re = /^[0-9\b]+$/;
    if (event.target.value === '' || re.test(event.target.value)) {
      const usdQty = this.convertVefToUsd(event.target.value);
      const satQty = this.convertToSat(event.target.value, this.state.btcPriceInVef);
      this.setState({ usdQty, satQty, vefQty: event.target.value });
    }
  }

  onUsdInputChange(event) {
    const re = /^[0-9\b]+$/;
    if (event.target.value === '' || re.test(event.target.value)) {
      const satQty = this.convertToSat(event.target.value, this.state.btcPriceInUsd);
      const vefQty = this.convertUsdToVef(event.target.value);
      this.setState({ vefQty, satQty, usdQty: event.target.value });
    }
  }

  renderHeader() {
    return (
      <div className="App-header">
        <img src={logo} className="App-logo" title="Satoshi Nakamoto" alt="Satoshi Nakamoto" />
      </div>
    );
  }

  renderContent() {
    return (
      <div className="jumbotron">
        <h1 className="display-4">¿Qué es un Satoshi?</h1>
        <p className="lead">
          El Bitcoin tiene hasta ocho lugares decimales, a la fracción más pequeña se le conoce como
          Satoshi. El nombre viene de la entidad desconocida a quien se le atribuye la creación del
          Bitcoin: Satoshi Nakamoto.
        </p>
        <p className="lead">
          Por lo tanto, 1 Bitcoin equivale a 100.000.000 (100 millones) de Satoshis.
        </p>
        <p className="lead">
          Estos ocho lugares decimales permiten tener acceso a Bitcoin sin la necesidad de tener que comprar uno entero.
        </p>
        <p className="lead">
          En Venezuela hoy en día el precio de 1 Bitcoin está alrededor de los {this.getBtcPriceInVefFmt()}, sin embargo es
          posible adquirir, por ejemplo {currencyFormatter.format(this.state.randomVefNum, { code: 'VEF' })} en Bitcoin.
          Por esos {currencyFormatter.format(this.state.randomVefNum, { code: 'VEF' })} recibirías&nbsp;
          {this.convertVefToBtc(this.state.randomVefNum)} Bitcoin ó {this.convertToSat(this.state.randomVefNum, this.state.btcPriceInVef)} Satoshis.
        </p>
      </div>
    );
  }

  renderPriceCard() {
    return (
      <div className="card text-center">
        <h5 className="card-header">Dólar Satoshi</h5>
        <div className="card-body">
          <h5 className="card-title">{this.getUsdPriceInVefFmt()}</h5>
        </div>
      </div>
    );
  }

  renderForm() {
    return (
      <form>
        <div className="input-group mb-3">
          <div className="input-group-append">
            <span className="input-group-text" id="sat">SAT</span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Cantidad de satoshis"
            aria-label="satoshis"
            aria-describedby="sat"
            value={this.state.satQty}
            onChange={this.onSatInputChange.bind(this)}
            disabled = {(this.state.disabled)? "disabled" : ""}
          />
        </div>
        <div className="input-group mb-3">
          <div className="input-group-append">
            <span className="input-group-text" id="vef">VEF</span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Cantidad de bolívares"
            aria-label="Cantidad de bolívares"
            aria-describedby="vef"
            onChange={this.onVefInputChange.bind(this)}
            value={this.state.vefQty}
            disabled = {(this.state.disabled)? "disabled" : ""}
          />
        </div>
        <div className="input-group mb-3">
          <div className="input-group-append">
            <span className="input-group-text" id="usd">USD</span>
          </div>
          <input
            type="text"
            className="form-control"
            placeholder="Cantidad de dólares"
            aria-label="Cantidad de dólares"
            aria-describedby="usd"
            onChange={this.onUsdInputChange.bind(this)}
            value={this.state.usdQty}
            disabled = {(this.state.disabled)? "disabled" : ""}
          />
        </div>
      </form>
    );
  }

  render() {
    return (
      <div className="App">
        {this.renderHeader()}
        <div className="container">
          <div className="row">
            <div className="col-md"></div>
            <div className="col-md">
              <div>&nbsp;</div>
              <div>
                {this.renderPriceCard()}
              </div>
            </div>
            <div className="col-md"></div>
          </div>
          <br />
          <div className="row">
            <div className="col-md">{this.renderForm()}</div>
          </div>
          <br />
          <div className="row">
            <div className="col-md">{this.renderContent()}</div>
          </div>
          <div className="row">
            <div className="col-md">
              Hecho en Venezuela con <FontAwesome className="red" name="heart" />
            </div>
          </div>
          <hr />
          <div className="row">
            <div className="col-md">
              <a href="https://github.com/vegnoll/dolarsatoshi" target="_blank" rel="noopener noreferrer">
                <FontAwesome
                  name="github"
                  size='2x'
                />
              </a>
              &nbsp;&nbsp;
              <a href="https://twitter.com/dolarsatoshi" target="_blank" rel="noopener noreferrer">
                <FontAwesome
                  name="twitter"
                  size='2x'
                />
              </a>
            </div>
          </div>
          <div className="row">
            <div className="col-md">
              <a
                href={`https://gateway.ipfs.io/ipfs/${version.current}`}
                target="_blank"
                rel="noopener noreferrer">
                <img
                  src={ipfs}
                  alt={version.current}
                  title={version.current}
                />
              </a>
            </div>
          </div>
        </div>
        <br />
      </div>
    );
  }
}

export default App;
