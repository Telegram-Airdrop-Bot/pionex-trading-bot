// Global variables
let socket;
let charts = {};
let updateInterval;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeSocket();
    initializeEventListeners();
    loadInitialData();
    startAutoUpdate();
});

// Initialize WebSocket connection
function initializeSocket() {
    socket = io();
    
    socket.on('connect', function() {
        console.log('Connected to server');
        updateConnectionStatus(true);
    });
    
    socket.on('disconnect', function() {
        console.log('Disconnected from server');
        updateConnectionStatus(false);
    });
    
    socket.on('price_update', function(data) {
        updatePriceDisplay(data);
    });
    
    socket.on('connected', function(data) {
        console.log('Socket connected:', data);
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // Auto trading buttons
    document.getElementById('enable-auto-trading').addEventListener('click', enableAutoTrading);
    document.getElementById('disable-auto-trading').addEventListener('click', disableAutoTrading);
    
    // Trade form
    document.getElementById('execute-trade').addEventListener('click', executeTrade);
    document.getElementById('trade-order-type').addEventListener('change', toggleLimitPrice);
    
    // Analysis
    document.getElementById('run-analysis').addEventListener('click', runAnalysis);
    
    // Settings
    document.getElementById('save-settings').addEventListener('click', saveSettings);
    
    // Strategy management
    const defaultStrategySelect = document.getElementById('default-strategy');
    if (defaultStrategySelect) {
        defaultStrategySelect.addEventListener('change', function() {
            updateStrategy(this.value);
        });
    }
    
    const testStrategyBtn = document.getElementById('test-strategy');
    if (testStrategyBtn) {
        testStrategyBtn.addEventListener('click', function() {
            const strategySelect = document.getElementById('default-strategy');
            const selectedStrategy = strategySelect ? strategySelect.value : 'ADVANCED_STRATEGY';
            testStrategy(selectedStrategy);
        });
    }
    
    // Chart symbol change
    document.getElementById('chart-symbol').addEventListener('change', function() {
        loadChartData(this.value);
    });
    
    // Chart timeframe change
    document.getElementById('chart-timeframe').addEventListener('change', function() {
        const symbol = document.getElementById('chart-symbol').value;
        loadChartData(symbol, this.value);
    });
    
    // Load chart data when Charts tab is clicked
    document.getElementById('charts-tab').addEventListener('click', function() {
        const symbol = document.getElementById('chart-symbol').value;
        loadChartData(symbol);
    });
    
    // Update modal balance when trade modal opens
    const tradeModal = document.getElementById('tradeModal');
    if (tradeModal) {
        tradeModal.addEventListener('show.bs.modal', updateModalBalance);
    }
    
    // Load current strategy when settings modal opens
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.addEventListener('show.bs.modal', function() {
            loadCurrentStrategy();
        });
    }
}

// Load initial data
function loadInitialData() {
    loadBalance();
    loadPositions();
    loadHistory();
    loadSettings();
    loadAutoTradingStatus();
    loadActiveStrategies();
    
    // Load initial chart data
    const symbol = document.getElementById('chart-symbol').value;
    loadChartData(symbol);
}

// Start auto update
function startAutoUpdate() {
    updateInterval = setInterval(function() {
        loadBalance();
        loadPositions();
        loadAutoTradingStatus();
        loadActiveStrategies(); // Refresh active strategies to update status
    }, 10000); // Update every 10 seconds
}

// Update connection status
function updateConnectionStatus(connected) {
    const statusElement = document.getElementById('connection-status');
    const textElement = document.getElementById('connection-text');
    
    if (statusElement && textElement) {
        if (connected) {
            statusElement.className = 'status-indicator status-online';
            textElement.textContent = 'Connected';
        } else {
            statusElement.className = 'status-indicator status-offline';
            textElement.textContent = 'Disconnected';
        }
    }
}

// Load account balance
function loadBalance() {
    fetch('/api/balance')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateBalanceDisplay(data.data);
            } else {
                showToast('Error', 'Failed to load balance: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading balance:', error);
            showToast('Error', 'Failed to load balance', 'error');
        });
}

// Update balance display
function updateBalanceDisplay(balance) {
    const totalBalance = parseFloat(balance.total || 0);
    const availableBalance = parseFloat(balance.available || 0);
    const frozenBalance = parseFloat(balance.frozen || 0);
    
    const totalBalanceElement = document.getElementById('total-balance');
    const availableBalanceElement = document.getElementById('available-balance');
    const frozenBalanceElement = document.getElementById('frozen-balance');

    if (totalBalanceElement) totalBalanceElement.textContent = formatCurrency(totalBalance);
    if (availableBalanceElement) availableBalanceElement.textContent = formatCurrency(availableBalance);
    if (frozenBalanceElement) frozenBalanceElement.textContent = formatCurrency(frozenBalance);
}

// Load positions
function loadPositions() {
    fetch('/api/positions')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updatePositionsTable(data.data);
            } else {
                showToast('Error', 'Failed to load positions: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading positions:', error);
            showToast('Error', 'Failed to load positions', 'error');
        });
}

// Update positions table
function updatePositionsTable(positions) {
    const tbody = document.getElementById('positions-table');
    
    if (!tbody) {
        console.error('Positions table not found');
        return;
    }

    if (!positions || positions.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No open positions</td></tr>';
        return;
    }
    
    let html = '';
    positions.forEach(position => {
        const size = parseFloat(position.size || 0);
        const entryPrice = parseFloat(position.entryPrice || 0);
        const markPrice = parseFloat(position.markPrice || 0);
        const pnl = parseFloat(position.unrealizedPnl || 0);
        const roe = parseFloat(position.roe || 0);
        const symbol = position.symbol || '';
        
        const pnlClass = pnl >= 0 ? 'text-success' : 'text-danger';
        const roeClass = roe >= 0 ? 'text-success' : 'text-danger';
        
        html += `
            <tr>
                <td><strong>${symbol}</strong></td>
                <td>${size.toFixed(4)}</td>
                <td>$${entryPrice.toFixed(4)}</td>
                <td>$${markPrice.toFixed(4)}</td>
                <td class="${pnlClass}">$${pnl.toFixed(2)}</td>
                <td class="${roeClass}">${roe.toFixed(2)}%</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="closePosition('${symbol}')">
                        <i class="fas fa-times"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Load trading history
function loadHistory() {
    fetch('/api/history')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateHistoryTable(data.data);
            } else {
                showToast('Error', 'Failed to load history: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading history:', error);
            showToast('Error', 'Failed to load history', 'error');
        });
}

// Update history table
function updateHistoryTable(history) {
    const tbody = document.getElementById('history-table');
    
    if (!tbody) {
        console.error('History table not found');
        return;
    }

    if (!history || history.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">No trading history</td></tr>';
        return;
    }
    
    let html = '';
    history.forEach(trade => {
        const time = new Date(trade.time || trade.timestamp).toLocaleString();
        const symbol = trade.symbol || '';
        const side = trade.side || '';
        const size = parseFloat(trade.size || 0);
        const price = parseFloat(trade.price || 0);
        const fee = parseFloat(trade.fee || 0);
        const pnl = parseFloat(trade.pnl || 0);
        
        const sideClass = side === 'BUY' ? 'text-success' : 'text-danger';
        const pnlClass = pnl >= 0 ? 'text-success' : 'text-danger';
        
        html += `
            <tr>
                <td>${time}</td>
                <td><strong>${symbol}</strong></td>
                <td class="${sideClass}">${side}</td>
                <td>${size.toFixed(4)}</td>
                <td>$${price.toFixed(4)}</td>
                <td>$${fee.toFixed(4)}</td>
                <td class="${pnlClass}">$${pnl.toFixed(2)}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// Load settings
function loadSettings() {
    fetch('/api/settings')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateSettingsForm(data.data);
            } else {
                showToast('Error', 'Failed to load settings: ' + data.error, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading settings:', error);
            showToast('Error', 'Failed to load settings', 'error');
        });
}

// Update settings form
function updateSettingsForm(settings) {
    const tradingPairElement = document.getElementById('setting-trading-pair');
    const positionSizeElement = document.getElementById('setting-position-size');
    const leverageElement = document.getElementById('setting-leverage');
    const stopLossElement = document.getElementById('setting-stop-loss');
    const takeProfitElement = document.getElementById('setting-take-profit');
    const trailingStopElement = document.getElementById('setting-trailing-stop');
    const defaultStrategyElement = document.getElementById('default-strategy');

    if (tradingPairElement) tradingPairElement.value = settings.trading_pair || 'DOT_USDT';
    if (positionSizeElement) positionSizeElement.value = settings.position_size || 0.5;
    if (leverageElement) leverageElement.value = settings.leverage || 10;
    if (stopLossElement) stopLossElement.value = settings.stop_loss_percentage || 1.5;
    if (takeProfitElement) takeProfitElement.value = settings.take_profit_percentage || 2.5;
    if (trailingStopElement) trailingStopElement.value = settings.trailing_stop_percentage || 1.0;
    if (defaultStrategyElement) defaultStrategyElement.value = settings.default_strategy || 'ADVANCED_STRATEGY';
}

// Load auto trading status
function loadAutoTradingStatus() {
    fetch('/api/auto-trading/status')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateAutoTradingStatus(data.data);
            } else {
                console.error('Failed to load auto trading status:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading auto trading status:', error);
        });
}

// Update auto trading status
function updateAutoTradingStatus(status) {
    const statusElement = document.getElementById('auto-trading-status');
    const textElement = document.getElementById('auto-trading-text');
    
    if (statusElement && textElement) {
        if (status && status.is_running) {
            statusElement.className = 'status-indicator status-online';
            textElement.textContent = 'Enabled';
        } else {
            statusElement.className = 'status-indicator status-offline';
            textElement.textContent = 'Disabled';
        }
    }
}

// Enable auto trading
function enableAutoTrading() {
    showLoading('enable-auto-trading');
    
    fetch('/api/auto-trading/enable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading('enable-auto-trading');
        if (data.success) {
            showToast('Success', 'Auto trading enabled', 'success');
            loadAutoTradingStatus();
            loadActiveStrategies(); // Refresh active strategies
        } else {
            showToast('Error', 'Failed to enable auto trading: ' + data.error, 'error');
        }
    })
    .catch(error => {
        hideLoading('enable-auto-trading');
        console.error('Error enabling auto trading:', error);
        showToast('Error', 'Failed to enable auto trading', 'error');
    });
}

// Disable auto trading
function disableAutoTrading() {
    showLoading('disable-auto-trading');
    
    fetch('/api/auto-trading/disable', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        hideLoading('disable-auto-trading');
        if (data.success) {
            showToast('Success', 'Auto trading disabled', 'success');
            loadAutoTradingStatus();
            loadActiveStrategies(); // Refresh active strategies
        } else {
            showToast('Error', 'Failed to disable auto trading: ' + data.error, 'error');
        }
    })
    .catch(error => {
        hideLoading('disable-auto-trading');
        console.error('Error disabling auto trading:', error);
        showToast('Error', 'Failed to disable auto trading', 'error');
    });
}

// Execute trade
async function executeTrade() {
    const symbol = document.getElementById('trade-symbol').value;
    const side = document.querySelector('input[name="trade-side"]:checked').value;
    const orderType = document.getElementById('trade-order-type').value;
    const quantity = parseFloat(document.getElementById('trade-quantity').value);
    const price = parseFloat(document.getElementById('trade-price').value);
    
    if (!symbol || !quantity) {
        showToast('Error', 'Please fill in all required fields', 'error');
        return;
    }
    
    if (orderType === 'LIMIT' && !price) {
        showToast('Error', 'Please enter a price for limit orders', 'error');
        return;
    }
    
    // Check balance before executing trade
    const totalBalance = parseFloat(document.getElementById('total-balance').textContent.replace(/[^0-9.-]+/g, ''));
    const availableBalance = parseFloat(document.getElementById('available-balance').textContent.replace(/[^0-9.-]+/g, ''));
    
    if (side === 'BUY' && availableBalance <= 0) {
        showToast('Error', 'Insufficient balance to execute buy order. Please add funds to your account.', 'error');
        return;
    }
    
    // Show confirmation for large trades
    const estimatedCost = side === 'BUY' ? quantity * (price || 50000) : 0; // Rough estimate
    if (side === 'BUY' && estimatedCost > availableBalance * 0.5) {
        const confirmTrade = confirm(
            `This trade will use approximately $${estimatedCost.toFixed(2)} from your available balance of $${availableBalance.toFixed(2)}. Do you want to proceed?`
        );
        if (!confirmTrade) {
            return;
        }
    }
    
    showLoading('execute-trade');
    
    try {
        const validationResult = await validateTrade(symbol, side, quantity, orderType, price);
        if (validationResult.valid) {
            const tradeData = {
                symbol: symbol,
                side: side,
                quantity: quantity,
                order_type: orderType
            };
            
            if (price) {
                tradeData.price = price;
            }
            
            const response = await fetch('/api/trade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(tradeData)
            });
            const data = await response.json();
            
            hideLoading('execute-trade');
            if (data.success) {
                showToast('Success', 'Trade executed successfully', 'success');
                document.getElementById('trade-form').reset();
                bootstrap.Modal.getInstance(document.getElementById('tradeModal')).hide();
                loadPositions();
                loadHistory();
                loadBalance(); // Refresh balance after trade
            } else {
                showToast('Error', 'Failed to execute trade: ' + data.error, 'error');
            }
        } else {
            hideLoading('execute-trade');
            showToast('Error', 'Trade validation failed: ' + validationResult.error, 'error');
        }
    } catch (error) {
        hideLoading('execute-trade');
        console.error('Error executing trade:', error);
        showToast('Error', 'Failed to execute trade', 'error');
    }
}

// Toggle limit price field
function toggleLimitPrice() {
    const orderType = document.getElementById('trade-order-type').value;
    const limitPriceGroup = document.getElementById('limit-price-group');
    
    if (limitPriceGroup) {
        if (orderType === 'LIMIT') {
            limitPriceGroup.style.display = 'block';
            document.getElementById('trade-price').required = true;
        } else {
            limitPriceGroup.style.display = 'none';
            document.getElementById('trade-price').required = false;
        }
    }
}

// Run analysis
function runAnalysis() {
    const symbol = document.getElementById('analysis-symbol').value;
    
    if (!symbol) {
        showToast('Error', 'Please select a symbol', 'error');
        return;
    }
    
    showLoading('run-analysis');
    
    fetch(`/api/analysis/${symbol}`)
        .then(response => response.json())
        .then(data => {
            hideLoading('run-analysis');
            if (data.success) {
                updateAnalysisResults(data.data);
                document.getElementById('analysis-results').style.display = 'block';
            } else {
                showToast('Error', 'Failed to run analysis: ' + data.error, 'error');
            }
        })
        .catch(error => {
            hideLoading('run-analysis');
            console.error('Error running analysis:', error);
            showToast('Error', 'Failed to run analysis', 'error');
        });
}

// Update analysis results
function updateAnalysisResults(analysis) {
    const rsi = analysis.rsi || 50;
    const macd = analysis.macd?.line || 0;
    const signal = analysis.macd?.signal || 0;
    
    const rsiValueElement = document.getElementById('rsi-value');
    const macdValueElement = document.getElementById('macd-value');
    const rsiStatusElement = document.getElementById('rsi-status');
    const macdStatusElement = document.getElementById('macd-status');
    const signalElement = document.getElementById('signal-value');

    if (rsiValueElement) rsiValueElement.textContent = rsi.toFixed(2);
    if (macdValueElement) macdValueElement.textContent = macd.toFixed(4);
    
    // Update RSI status
    if (rsiStatusElement) {
        if (rsi > 70) {
            rsiStatusElement.textContent = 'Overbought';
            rsiStatusElement.className = 'metric-label text-danger';
        } else if (rsi < 30) {
            rsiStatusElement.textContent = 'Oversold';
            rsiStatusElement.className = 'metric-label text-success';
        } else {
            rsiStatusElement.textContent = 'Neutral';
            rsiStatusElement.className = 'metric-label text-warning';
        }
    }
    
    // Update MACD status
    if (macdStatusElement) {
        if (macd > signal) {
            macdStatusElement.textContent = 'Bullish';
            macdStatusElement.className = 'metric-label text-success';
        } else {
            macdStatusElement.textContent = 'Bearish';
            macdStatusElement.className = 'metric-label text-danger';
        }
    }
    
    // Update signal
    if (signalElement) {
        let recommendation = 'HOLD';
        let signalClass = 'text-warning';
        
        if (rsi < 30 && macd > signal) {
            recommendation = 'BUY';
            signalClass = 'text-success';
        } else if (rsi > 70 && macd < signal) {
            recommendation = 'SELL';
            signalClass = 'text-danger';
        }
        
        signalElement.textContent = recommendation;
        signalElement.className = `metric-value ${signalClass}`;
    }
}

// Load active strategies
function loadActiveStrategies() {
    fetch('/api/strategy')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateActiveStrategiesDisplay(data.data);
            } else {
                console.error('Error loading strategies:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading strategies:', error);
        });
}

// Load current strategy
function loadCurrentStrategy() {
    fetch('/api/strategy')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const strategySelect = document.getElementById('default-strategy');
                const strategyStatus = document.getElementById('strategy-status');
                
                if (strategySelect) {
                    strategySelect.value = data.data.current_strategy;
                }
                
                if (strategyStatus) {
                    // Check if auto trading is enabled
                    const autoTradingStatusElement = document.getElementById('auto-trading-text');
                    const isAutoTradingEnabled = autoTradingStatusElement && autoTradingStatusElement.textContent === 'Enabled';
                    
                    strategyStatus.textContent = isAutoTradingEnabled ? 'Active' : 'Inactive';
                    strategyStatus.className = isAutoTradingEnabled ? 'badge bg-success me-2' : 'badge bg-warning me-2';
                }
            } else {
                console.error('Error loading current strategy:', data.error);
            }
        })
        .catch(error => {
            console.error('Error loading current strategy:', error);
        });
}

// Update active strategies display
function updateActiveStrategiesDisplay(strategyData) {
    const activeStrategiesContainer = document.getElementById('active-strategies');
    
    if (!activeStrategiesContainer) {
        console.error('Active strategies container not found');
        return;
    }
    
    if (!strategyData.current_strategy) {
        activeStrategiesContainer.innerHTML = '<p class="text-muted">No active strategies</p>';
        return;
    }
    
    const strategyName = strategyData.current_strategy;
    const strategyStatus = strategyData.status;
    const description = strategyData.descriptions ? strategyData.descriptions[strategyName] : '';
    
    // Check if auto trading is enabled by looking at the auto trading status
    const autoTradingStatusElement = document.getElementById('auto-trading-text');
    const isAutoTradingEnabled = autoTradingStatusElement && autoTradingStatusElement.textContent === 'Enabled';
    
    const statusBadge = isAutoTradingEnabled ? 
        '<span class="badge bg-success me-2">Active</span>' : 
        '<span class="badge bg-warning me-2">Inactive</span>';
    
    activeStrategiesContainer.innerHTML = `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="mb-1">${strategyName.replace(/_/g, ' ')}</h6>
                        <p class="text-muted small mb-2">${description || 'No description available'}</p>
                    </div>
                    ${statusBadge}
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary" onclick="testStrategy('${strategyName}')">
                        <i class="fas fa-play me-1"></i>Test
                    </button>
                    <button class="btn btn-sm btn-outline-secondary" onclick="editStrategy('${strategyName}')">
                        <i class="fas fa-edit me-1"></i>Edit
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Test strategy function
function testStrategy(strategyName) {
    const symbol = document.getElementById('chart-symbol').value || 'BTCUSDT';
    
    fetch('/api/strategy/test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            strategy: strategyName,
            symbol: symbol
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Success', `Strategy test completed. Signal: ${data.data.signal?.action || 'No signal'}`, 'success');
        } else {
            showToast('Error', data.error || 'Strategy test failed', 'error');
        }
    })
    .catch(error => {
        console.error('Error testing strategy:', error);
        showToast('Error', 'Strategy test failed', 'error');
    });
}

// Update strategy function
function updateStrategy(strategyName) {
    fetch('/api/strategy', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ strategy: strategyName })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showToast('Success', `Strategy updated to ${strategyName}`, 'success');
            // Reload active strategies to reflect the change
            loadActiveStrategies();
        } else {
            showToast('Error', data.error || 'Failed to update strategy', 'error');
        }
    })
    .catch(error => {
        console.error('Error updating strategy:', error);
        showToast('Error', 'Failed to update strategy', 'error');
    });
}

// Edit strategy function
function editStrategy(strategyName) {
    // Open settings modal and set the strategy
    const strategySelect = document.getElementById('default-strategy');
    if (strategySelect) {
        strategySelect.value = strategyName;
    }
    
    // Show settings modal
    const settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
    settingsModal.show();
}

// Update settings to include strategy management
function saveSettings() {
    const settings = {
        trading_pair: document.getElementById('setting-trading-pair').value,
        position_size: parseFloat(document.getElementById('setting-position-size').value),
        leverage: parseInt(document.getElementById('setting-leverage').value),
        stop_loss_percentage: parseFloat(document.getElementById('setting-stop-loss').value),
        take_profit_percentage: parseFloat(document.getElementById('setting-take-profit').value),
        trailing_stop_percentage: parseFloat(document.getElementById('setting-trailing-stop').value),
        default_strategy: document.getElementById('default-strategy').value
    };
    
    showLoading('save-settings');
    
    fetch('/api/settings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
    })
    .then(response => response.json())
    .then(data => {
        hideLoading('save-settings');
        if (data.success) {
            showToast('Success', 'Settings saved successfully', 'success');
            bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
            // Reload active strategies after saving settings
            loadActiveStrategies();
        } else {
            showToast('Error', 'Failed to save settings: ' + data.error, 'error');
        }
    })
    .catch(error => {
        hideLoading('save-settings');
        console.error('Error saving settings:', error);
        showToast('Error', 'Failed to save settings', 'error');
    });
}

// Load chart data
function loadChartData(symbol, timeframe = '5M') {
    const chartCanvas = document.getElementById('price-chart');
    if (!chartCanvas) {
        console.error('Price chart canvas not found');
        return;
    }
    
    const ctx = chartCanvas.getContext('2d');
    
    if (charts.priceChart) {
        charts.priceChart.destroy();
    }
    
    // Show loading state
    const chartContainer = chartCanvas.parentElement;
    if (chartContainer) {
        chartContainer.innerHTML = '<div class="text-center p-4"><div class="spinner-border" role="status"><span class="visually-hidden">Loading chart data...</span></div><div class="mt-2">Loading price data for ' + symbol + ' (' + timeframe + ')...</div></div>';
    }
    
    console.log('Loading chart data for symbol:', symbol, 'timeframe:', timeframe);
    
    // Fetch real chart data from API with timeframe
    fetch(`/api/chart-data/${symbol}?timeframe=${timeframe}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Chart data response:', data);
            if (data.success) {
                createChart(ctx, data.data, symbol);
            } else {
                // Fallback to sample data if API fails
                console.warn('Failed to load chart data:', data.error);
                createSampleChart(ctx, symbol, data.error);
            }
        })
        .catch(error => {
            console.error('Error loading chart data:', error);
            createSampleChart(ctx, symbol, 'Network error: ' + error.message);
        });
}

// Create chart with real data
function createChart(ctx, chartData, symbol) {
    const chartCanvas = document.getElementById('price-chart');
    if (!chartCanvas) {
        console.error('Price chart canvas not found');
        return;
    }
    
    const chartContainer = chartCanvas.parentElement;
    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }
    
    chartContainer.innerHTML = '<canvas id="price-chart" height="400"></canvas>';
    const newCtx = document.getElementById('price-chart').getContext('2d');
    
    // Check if we have OHLC data for candlestick chart
    const hasOHLC = chartData.high && chartData.low && chartData.open && chartData.prices;
    
    if (hasOHLC && chartData.high.length > 0) {
        // Create candlestick chart
        createCandlestickChart(newCtx, chartData, symbol);
    } else {
        // Create line chart as fallback
        createLineChart(newCtx, chartData, symbol);
    }
}

// Create candlestick chart
function createCandlestickChart(ctx, chartData, symbol) {
    const datasets = [
        {
            label: `${symbol} Price`,
            data: chartData.prices.map((price, index) => ({
                x: chartData.labels[index],
                y: price
            })),
            borderColor: '#3498db',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            tension: 0.4,
            fill: false,
            pointRadius: 0
        }
    ];
    
    // Add volume as secondary dataset if available
    if (chartData.volumes && chartData.volumes.length > 0) {
        const maxVolume = Math.max(...chartData.volumes);
        datasets.push({
            label: 'Volume',
            data: chartData.volumes.map((volume, index) => ({
                x: chartData.labels[index],
                y: (volume / maxVolume) * Math.max(...chartData.prices) * 0.3
            })),
            borderColor: '#e74c3c',
            backgroundColor: 'rgba(231, 76, 60, 0.3)',
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            yAxisID: 'y1'
        });
    }
    
    charts.priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3498db',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            if (label.includes('Volume')) {
                                const volumeIndex = context.dataIndex;
                                const actualVolume = chartData.volumes[volumeIndex];
                                return `${label}: ${actualVolume.toLocaleString()}`;
                            }
                            return `${label}: $${value.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y1: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Create line chart (fallback)
function createLineChart(ctx, chartData, symbol) {
    charts.priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.labels,
            datasets: [{
                label: `${symbol} Price`,
                data: chartData.prices,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3498db',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Create sample chart as fallback
function createSampleChart(ctx, symbol, errorMessage) {
    const chartCanvas = document.getElementById('price-chart');
    if (!chartCanvas) {
        console.error('Price chart canvas not found');
        return;
    }
    
    const chartContainer = chartCanvas.parentElement;
    if (!chartContainer) {
        console.error('Chart container not found');
        return;
    }
    
    chartContainer.innerHTML = '<canvas id="price-chart" height="400"></canvas>';
    const newCtx = document.getElementById('price-chart').getContext('2d');
    
    // Create sample data
    const labels = [];
    const prices = [];
    const now = new Date();
    
    for (let i = 24; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000);
        labels.push(time.toLocaleTimeString());
        prices.push(Math.random() * 1000 + 50000); // Sample price
    }
    
    const chartTitle = errorMessage ? 
        `${symbol} Price (Sample Data - ${errorMessage})` : 
        `${symbol} Price (Sample Data)`;
    
    charts.priceChart = new Chart(newCtx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: chartTitle,
                data: prices,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 2,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#e74c3c',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: '#ffffff',
                        maxTicksLimit: 10
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    ticks: {
                        color: '#ffffff',
                        callback: function(value) {
                            return '$' + value.toFixed(2);
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
}

// Close position
function closePosition(symbol) {
    if (confirm(`Are you sure you want to close the position for ${symbol}?`)) {
        // This would be implemented to close the position
        showToast('Info', 'Position close functionality not implemented yet', 'info');
    }
}

// Update price display
function updatePriceDisplay(data) {
    // This would update real-time price displays
    console.log('Price update:', data);
}

// Update modal balance display
function updateModalBalance() {
    try {
        // Get balance elements with null checks
        const totalBalanceElement = document.getElementById('total-balance');
        const availableBalanceElement = document.getElementById('available-balance');
        const frozenBalanceElement = document.getElementById('frozen-balance');
        
        // Get modal balance elements
        const modalTotalBalanceElement = document.getElementById('modal-total-balance');
        const modalAvailableBalanceElement = document.getElementById('modal-available-balance');
        const modalFrozenBalanceElement = document.getElementById('modal-frozen-balance');
        
        // Check if all required elements exist
        if (!totalBalanceElement || !availableBalanceElement || !frozenBalanceElement) {
            console.warn('Balance elements not found, skipping modal balance update');
            return;
        }
        
        if (!modalTotalBalanceElement || !modalAvailableBalanceElement || !modalFrozenBalanceElement) {
            console.warn('Modal balance elements not found, skipping modal balance update');
            return;
        }
        
        // Parse balance values with error handling
        let totalBalance = 0;
        let availableBalance = 0;
        let frozenBalance = 0;
        
        try {
            totalBalance = parseFloat(totalBalanceElement.textContent.replace(/[^0-9.-]+/g, '')) || 0;
            availableBalance = parseFloat(availableBalanceElement.textContent.replace(/[^0-9.-]+/g, '')) || 0;
            frozenBalance = parseFloat(frozenBalanceElement.textContent.replace(/[^0-9.-]+/g, '')) || 0;
        } catch (e) {
            console.error('Error parsing balance values:', e);
            totalBalance = availableBalance = frozenBalance = 0;
        }
        
        // Update modal balance display
        modalTotalBalanceElement.textContent = formatCurrency(totalBalance);
        modalAvailableBalanceElement.textContent = formatCurrency(availableBalance);
        if (modalFrozenBalanceElement) {
            modalFrozenBalanceElement.textContent = formatCurrency(frozenBalance);
        }
        
    } catch (error) {
        console.error('Error updating modal balance:', error);
    }
}

// Show loading state
function showLoading(buttonId) {
    const button = document.getElementById(buttonId);
    const loading = button ? button.querySelector('.loading') : null;
    
    if (!loading) {
        console.warn(`Loading element not found for button: ${buttonId}`);
        return;
    }
    
    if (button) button.disabled = true;
    loading.style.display = 'inline-block';
    
    // Hide all other content in the button
    if (button) {
        const otherElements = button.querySelectorAll(':not(.loading)');
        otherElements.forEach(el => el.style.display = 'none');
    }
}

// Hide loading state
function hideLoading(buttonId) {
    const button = document.getElementById(buttonId);
    const loading = button ? button.querySelector('.loading') : null;
    
    if (!loading) {
        console.warn(`Loading element not found for button: ${buttonId}`);
        return;
    }
    
    if (button) button.disabled = false;
    loading.style.display = 'none';
    
    // Show all other content in the button
    if (button) {
        const otherElements = button.querySelectorAll(':not(.loading)');
        otherElements.forEach(el => el.style.display = 'inline');
    }
}

// Show toast notification
function showToast(title, message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastMessage = document.getElementById('toast-message');
    
    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    
    // Set toast color based on type
    if (toast) toast.className = `toast ${type === 'error' ? 'bg-danger' : type === 'success' ? 'bg-success' : 'bg-info'}`;
    
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// Format percentage
function formatPercentage(value) {
    return `${value.toFixed(2)}%`;
}

// Validate trade before execution
function validateTrade(symbol, side, quantity, orderType, price) {
    return new Promise((resolve, reject) => {
        const tradeData = {
            symbol: symbol,
            side: side,
            quantity: quantity,
            order_type: orderType
        };
        
        if (price) {
            tradeData.price = price;
        }
        
        fetch('/api/trade/validate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tradeData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.valid) {
                resolve(data);
            } else {
                reject(new Error(data.error));
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

// Check if user has sufficient balance for trading
function checkBalanceForTrade(side, quantity, estimatedPrice = 50000) {
    const availableBalance = parseFloat(document.getElementById('available-balance').textContent.replace(/[^0-9.-]+/g, ''));
    
    if (side === 'BUY') {
        const estimatedCost = quantity * estimatedPrice;
        
        if (availableBalance <= 0) {
            return {
                canTrade: false,
                message: 'Insufficient balance. Please add funds to your account.',
                type: 'error'
            };
        }
        
        if (estimatedCost > availableBalance) {
            return {
                canTrade: false,
                message: `Insufficient balance. Estimated cost: $${estimatedCost.toFixed(2)}, Available: $${availableBalance.toFixed(2)}`,
                type: 'error'
            };
        }
        
        if (estimatedCost > availableBalance * 0.8) {
            return {
                canTrade: true,
                message: `Warning: This trade will use ${((estimatedCost/availableBalance)*100).toFixed(1)}% of your available balance.`,
                type: 'warning'
            };
        }
        
        return {
            canTrade: true,
            message: 'Sufficient balance available.',
            type: 'success'
        };
    }
    
    return {
        canTrade: true,
        message: 'Sell order - checking asset balance...',
        type: 'info'
    };
}

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    if (socket) {
        socket.disconnect();
    }
}); 