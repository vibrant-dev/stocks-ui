const uri = 'https://worker-js-app.christyram99.workers.dev/'
const mcUri = 'https://api.moneycontrol.com/mcapi/v1/stock/get-stock-price'

var currentPath = window.location.pathname
var splittedQueryPath = window.location.href.split('?')

var qs = (function(a) {
  if (a == "") return {};
  var b = {};
  for (var i = 0; i < a.length; ++i) {
      var p=a[i].split('=', 2);
      if (p[1]) p[1] = decodeURIComponent(p[1].replace(/\+/g, " "));
      b[p[0]] = p[1];
  }
  return b;
})((splittedQueryPath[1] && splittedQueryPath[1].split('&')) || '');

function apiRequest({ method = 'get', url, uriType = 'internal', data }) {
  const requestOptions = {
    method: method,
    url: uriType === 'internal' ? uri + url : mcUri + url,
    contentType: 'application/json; charset=utf-8',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json;charset=UTF-8'
    },
  }

  if (data) {
    requestOptions.data = JSON.stringify(data)
  }

  return axios(requestOptions);
}

var app = new Vue({
  el: '#mainApp',
  data: function () {
    return {
      watchlists: [],
      watchlist: {},
      qs: qs,
      stocksData: {},
      stockNotes: [],
      stockEvents: [],
      dateFns,
      currentPath,
      addStockCode: null,
    }
  },
  async created() {
    console.log(this.qs, this.currentPath)
    try {
      if (this.currentPath === '/' || this.currentPath === '/index.html' || this.currentPath === '/index') {
        const response = await apiRequest({ method: 'get', url: 'watchlists' })
        this.watchlists = response.data
      } else if (this.currentPath === '/watchlist.html' || this.currentPath === '/watchlist') {
        console.log('watchlist')
        const response = await apiRequest({ method: 'get', url: 'watchlists/' + qs._id })
        this.watchlist = response.data

        const stocks = this.watchlist.stocks

        const stocksResponse = await apiRequest({ uriType: 'mc', url: `?scIdList=${stocks.join(',')}&scId=${stocks[0]}`  })
        this.stocksData = stocksResponse.data.data.map((el, index) => {
          el.scrip_code = stocks[index]
          return el
        })
        console.log('completed watchlist')
      } else if (this.currentPath === '/stock.html' || this.currentPath === '/stock') {
        // const stocksResponse = await apiRequest({ uriType: 'mc', url: `?scIdList=${stocks.join(',')}&scId=${stocks[0]}`  })
        // this.stocksData = stocksResponse.data.data

        const response = await apiRequest({ method: 'get', url: 'stock-notes/' + qs.scrip_code })
        this.stockNotes = response.data

        const response2 = await apiRequest({ method: 'get', url: 'stock-events/' + qs.scrip_code })
        this.stockEvents = response2.data

        console.log('stockEvents', this.stockEvents)
      }

      document.getElementById('mainApp').style.display = 'block'
    } catch (err) {
      console.log(err)
    }
  },
  computed: {
    displayPrice() {
      return price => {
        return `???${price}`
      }
    }
  },
  methods: {
    async addStock() {
      try {
        console.log('sd', this.addStockCode)
        console.log('hi', qs)
  
        const data = {
          scrip_code: this.addStockCode,
        }
  
        await apiRequest({ method: 'post', url: 'add-stock-to-watchlist/' + qs._id, data })

        alert('Stock added successfully')
      } catch (err) {
        console.log(err)
      }
    }
  }
})