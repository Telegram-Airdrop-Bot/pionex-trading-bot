    // Strategy Management Functions
    async function loadCurrentStrategy() {
        try {
            const response = await fetch('/api/strategy');
            const data = await response.json();
            
            if (data.success) {
                const strategySelect = document.getElementById('default-strategy');
                const strategyStatus = document.getElementById('strategy-status');
                
                if (strategySelect) {
                    strategySelect.value = data.data.current_strategy;
                }
                
                if (strategyStatus) {
                    strategyStatus.textContent = data.data.status;
                    strategyStatus.className = data.data.status === 'active' ? 'badge bg-success me-2' : 'badge bg-warning me-2';
                }
                
                // Update strategy descriptions visibility
                updateStrategyDescriptions(data.data.current_strategy);
            }
        } catch (error) {
            console.error('Error loading current strategy:', error);
        }
    }
    
    async function updateStrategy(strategyName) {
        try {
            showLoading(document.getElementById('update-settings-btn'));
            
            const response = await fetch('/api/strategy', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ strategy: strategyName })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast('success', `Strategy updated to ${strategyName}`);
                await loadCurrentStrategy();
            } else {
                showToast('error', data.error || 'Failed to update strategy');
            }
        } catch (error) {
            console.error('Error updating strategy:', error);
            showToast('error', 'Failed to update strategy');
        } finally {
            hideLoading(document.getElementById('update-settings-btn'));
        }
    }
    
    async function testStrategy(strategyName, symbol = null) {
        try {
            const testBtn = document.getElementById('test-strategy');
            showLoading(testBtn);
            
            const response = await fetch('/api/strategy/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    strategy: strategyName,
                    symbol: symbol || 'BTC_USDT'
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                const result = data.data;
                showToast('success', `Strategy test completed. Signal: ${result.signal?.action || 'No signal'}`);
                
                // Show detailed results in a modal or update analysis section
                updateAnalysisResults(result);
            } else {
                showToast('error', data.error || 'Strategy test failed');
            }
        } catch (error) {
            console.error('Error testing strategy:', error);
            showToast('error', 'Strategy test failed');
        } finally {
            hideLoading(document.getElementById('test-strategy'));
        }
    }
    
    function updateStrategyDescriptions(selectedStrategy) {
        const descriptions = document.querySelectorAll('.strategy-desc');
        descriptions.forEach(desc => {
            if (desc.dataset.strategy === selectedStrategy) {
                desc.style.display = 'block';
                desc.style.backgroundColor = '#f8f9fa';
                desc.style.padding = '10px';
                desc.style.borderRadius = '5px';
                desc.style.border = '2px solid #007bff';
            } else {
                desc.style.display = 'none';
            }
        });
    }
    
    function updateAnalysisResults(testResult) {
        const analysisResults = document.getElementById('analysis-results');
        if (analysisResults && testResult) {
            analysisResults.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <h6>Strategy Test Results</h6>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Strategy:</strong> ${testResult.strategy}</p>
                                <p><strong>Symbol:</strong> ${testResult.symbol}</p>
                                <p><strong>Current Price:</strong> $${testResult.current_price?.toFixed(2) || 'N/A'}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Signal:</strong> ${testResult.signal?.action || 'No signal'}</p>
                                <p><strong>Confidence:</strong> ${testResult.signal?.confidence || 'N/A'}</p>
                                <p><strong>Data Points:</strong> ${testResult.market_data_points}</p>
                            </div>
                        </div>
                        <div class="mt-2">
                            <small class="text-muted">Tested at: ${new Date(testResult.timestamp).toLocaleString()}</small>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    // Add event listeners for strategy management
    document.addEventListener('DOMContentLoaded', function() {
        const strategySelect = document.getElementById('default-strategy');
        const testStrategyBtn = document.getElementById('test-strategy');
        
        if (strategySelect) {
            strategySelect.addEventListener('change', function() {
                const selectedStrategy = this.value;
                updateStrategy(selectedStrategy);
            });
        }
        
        if (testStrategyBtn) {
            testStrategyBtn.addEventListener('click', function() {
                const strategySelect = document.getElementById('default-strategy');
                const selectedStrategy = strategySelect ? strategySelect.value : 'ADVANCED_STRATEGY';
                testStrategy(selectedStrategy);
            });
        }
        
        // Load current strategy on page load
        loadCurrentStrategy();
    }); 