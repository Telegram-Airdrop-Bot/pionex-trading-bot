# Pionex Trading Bot - GUI Version

A modern web-based GUI for the Pionex Trading Bot that provides a user-friendly interface for managing trading strategies, monitoring positions, and executing trades without requiring a Telegram bot token.

## Features

### 🎯 Core Features
- **Real-time Dashboard**: Monitor account balance, positions, and P&L
- **Auto Trading**: Enable/disable automated trading strategies
- **Manual Trading**: Execute trades directly from the interface
- **Technical Analysis**: Run RSI, MACD, and other technical indicators
- **Portfolio Management**: View and manage open positions
- **Trading History**: Track all trading activities
- **Settings Management**: Configure trading parameters
- **Real-time Updates**: WebSocket-based live data updates

### 📊 Trading Capabilities
- **Multiple Strategies**: RSI, MACD, Volume Filter, Grid Trading, DCA
- **Risk Management**: Stop-loss, take-profit, trailing stops
- **Position Management**: View, close, and monitor positions
- **Order Types**: Market, Limit, and advanced order types
- **Multi-timeframe Analysis**: Advanced technical analysis

### 🎨 User Interface
- **Modern Design**: Dark theme with professional styling
- **Responsive Layout**: Works on desktop and mobile devices
- **Real-time Charts**: Interactive price charts with Chart.js
- **Toast Notifications**: User-friendly feedback system
- **Loading States**: Visual feedback for all operations

## Installation

### Prerequisites
- Python 3.8 or higher
- Pionex API credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pionex-trading-bot
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment variables**
   Create a `.env` file in the project root:
   ```env
   PIONEX_API_KEY=your_api_key_here
   PIONEX_SECRET_KEY=your_secret_key_here
   SECRET_KEY=your_flask_secret_key_here
   ```

4. **Configure settings**
   Edit `config.yaml` to set your trading preferences:
   ```yaml
   trading_pair: DOT_USDT
   position_size: 0.5
   leverage: 10
   stop_loss_percentage: 1.5
   take_profit_percentage: 2.5
   ```

## Usage

### Starting the Application

1. **Run the GUI application**
   ```bash
   python run_gui.py
   ```

2. **Access the interface**
   - The application will automatically open in your default browser
   - Or navigate to `http://127.0.0.1:5000`

### Using the Interface

#### Dashboard
- **Account Balance**: View total, available, and frozen balances
- **P&L Overview**: Monitor realized and unrealized profits/losses
- **Auto Trading Status**: Enable/disable automated trading
- **Quick Actions**: Access manual trading, analysis, and settings

#### Positions Tab
- View all open positions
- Monitor entry price, mark price, P&L, and ROE
- Close positions with one click

#### Trading History Tab
- Review all trading activities
- Track trade details including fees and P&L

#### Strategies Tab
- Monitor active trading strategies
- View strategy performance metrics
- Manage strategy configurations

#### Charts Tab
- Interactive price charts
- Select different trading pairs
- Real-time price updates

### Manual Trading

1. Click "Manual Trade" from Quick Actions
2. Select trading pair (BTC/USDT, ETH/USDT, DOT/USDT)
3. Choose side (Buy/Sell)
4. Select order type (Market/Limit)
5. Enter quantity
6. For limit orders, enter price
7. Click "Execute Trade"

### Technical Analysis

1. Click "Technical Analysis" from Quick Actions
2. Select a trading pair
3. Click "Run Analysis"
4. View RSI, MACD, and trading signals
5. Get buy/sell recommendations

### Settings

1. Click "Settings" from Quick Actions
2. Configure trading parameters:
   - Trading pair
   - Position size
   - Leverage
   - Stop loss percentage
   - Take profit percentage
   - Trailing stop percentage
3. Click "Save Settings"

## Configuration

### Trading Parameters

Edit `config.yaml` to customize trading behavior:

```yaml
# Basic Settings
trading_pair: DOT_USDT
position_size: 0.5
leverage: 10

# Risk Management
stop_loss_percentage: 1.5
take_profit_percentage: 2.5
trailing_stop_percentage: 1.0

# Technical Indicators
rsi:
  period: 7
  overbought: 70
  oversold: 30

macd:
  fast: 12
  slow: 26
  signal: 9

# GUI Settings
gui:
  host: '127.0.0.1'
  port: 5000
  debug: false
```

### Environment Variables

Required environment variables in `.env`:

```env
PIONEX_API_KEY=your_api_key_here
PIONEX_SECRET_KEY=your_secret_key_here
SECRET_KEY=your_flask_secret_key_here
```

## API Endpoints

The GUI communicates with the backend through REST API endpoints:

- `GET /api/balance` - Get account balance
- `GET /api/positions` - Get open positions
- `GET /api/portfolio` - Get portfolio overview
- `GET /api/history` - Get trading history
- `GET /api/settings` - Get current settings
- `POST /api/settings` - Update settings
- `POST /api/auto-trading/enable` - Enable auto trading
- `POST /api/auto-trading/disable` - Disable auto trading
- `GET /api/auto-trading/status` - Get auto trading status
- `POST /api/trade` - Execute manual trade
- `GET /api/analysis/<symbol>` - Get technical analysis

## WebSocket Events

Real-time updates via WebSocket:

- `connect` - Client connected
- `disconnect` - Client disconnected
- `price_update` - Real-time price updates
- `subscribe_price` - Subscribe to price updates

## Security

### API Security
- All API calls require valid Pionex credentials
- Sensitive data is not stored in the frontend
- API keys are kept secure in environment variables

### Web Security
- Flask secret key for session management
- CORS protection for API endpoints
- Input validation on all forms
- XSS protection through proper escaping

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Check if Pionex API credentials are correct
   - Verify network connectivity
   - Check firewall settings

2. **GUI Not Loading**
   - Ensure all dependencies are installed
   - Check if port 5000 is available
   - Verify Flask is running

3. **Auto Trading Not Working**
   - Check trading hours configuration
   - Verify account has sufficient balance
   - Review strategy settings

4. **Charts Not Displaying**
   - Check browser console for JavaScript errors
   - Ensure Chart.js is loading properly
   - Verify WebSocket connection

### Logs

Check the logs directory for detailed error information:
- `logs/trading_bot.log` - Main application logs
- `logs/auto_trader_*.log` - Auto trading logs

## Development

### Project Structure

```
pionex-trading-bot/
├── gui_app.py              # Main GUI application
├── run_gui.py              # GUI entry point
├── templates/
│   └── index.html          # Main HTML template
├── static/
│   └── js/
│       └── app.js          # Frontend JavaScript
├── config.yaml             # Configuration file
├── requirements.txt         # Python dependencies
└── README_GUI.md          # This file
```

### Adding New Features

1. **Backend API**
   - Add new routes in `gui_app.py`
   - Implement corresponding methods in `TradingBotGUI` class

2. **Frontend**
   - Update HTML in `templates/index.html`
   - Add JavaScript functions in `static/js/app.js`

3. **Configuration**
   - Add new settings to `config.yaml`
   - Update settings form in the GUI

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Verify configuration settings
4. Test with a small position first

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This software is for educational and research purposes. Trading cryptocurrencies involves substantial risk of loss. Use at your own risk and never invest more than you can afford to lose. 