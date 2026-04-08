
        // Configuration
        const CONFIG = {
            apiKey: '353e12df6ccc210ab17c8cc917aad2aa47b84cd76e764c8dd27944dfb150f60d',
            refCode: 'acd06ccaddab66',
            changenowBaseUrl: '/api/changenow',
        };

        const currencyValidation = {
            'BTC':  { regex: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/, placeholder: 'bc1q... or 1... or 3...' },
            'ETH':  { regex: /^0x[a-fA-F0-9]{40}$/, placeholder: '0x...' },
            'XMR':  { regex: /^4[0-9AB][a-km-zA-HJ-NP-Z]{93}$|^8[a-km-zA-HJ-NP-Z]{95}$/, placeholder: '4... (95 characters)' },
            'USDT': { regex: /^0x[a-fA-F0-9]{40}$|^T[a-zA-Z0-9]{33}$/, placeholder: '0x... or T...' },
            'LTC':  { regex: /^[LM3][a-km-zA-HJ-NP-Z]{26,33}$|^ltc1[a-z0-9]{39,59}$/i, placeholder: 'L... or M... or ltc1...' },
            'XRP':  { regex: /^r[1-9A-HJ-NP-Za-km-z]{24,34}$/, placeholder: 'r...' },
            'ADA':  { regex: /^addr1[a-z0-9]{58}$/, placeholder: 'addr1...' },
            'SOL':  { regex: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/, placeholder: 'Solana address...' },
            'DOGE': { regex: /^D[5-9A-HJ-NP-U][a-km-zA-HJ-NP-Z]{32}$/, placeholder: 'D...' },
            'DOT':  { regex: /^1[2-9a-zA-Z]{32}$/, placeholder: 'Polkadot address...' },
            'MATIC':{ regex: /^0x[a-fA-F0-9]{40}$/, placeholder: '0x...' },
            'AVAX': { regex: /^X-avax1[a-z0-9]{39}$|^0x[a-fA-F0-9]{40}$/, placeholder: 'X-avax1... or 0x...' },
            'LINK': { regex: /^0x[a-fA-F0-9]{40}$/, placeholder: '0x...' },
            'UNI':  { regex: /^0x[a-fA-F0-9]{40}$/, placeholder: '0x...' },
            'BNB':  { regex: /^bnb1[a-z0-9]{38}$|^0x[a-fA-F0-9]{40}$/, placeholder: 'bnb1... or 0x...' }
        };

        // DOM Elements
        const swapWidget     = document.querySelector('.swap-widget');
        const trackingWidget = document.getElementById('tracking-widget');
        
        const fromCurrency   = document.getElementById('from-currency');
        const toCurrency     = document.getElementById('to-currency');
        const fromAmount     = document.getElementById('from-amount');
        const toAmount       = document.getElementById('to-amount');
        const receiveAddress = document.getElementById('receive-address');
        const submitBtn      = document.getElementById('submit-btn');
        const swapDirection  = document.getElementById('swap-direction');
        const swapRate       = document.getElementById('swap-rate');
        const retryRateBtn   = document.getElementById('retry-rate-btn');
        const exchangeRate   = document.getElementById('exchange-rate');
        const networkFee     = document.getElementById('network-fee');
        const estimatedTime  = document.getElementById('estimated-time');
        const copyOnionBtn   = document.getElementById('copy-onion-btn');
        const resultMessage  = document.getElementById('result-message');
        
        const addressError     = document.getElementById('address-error');
        const minAmountWarning = document.getElementById('min-amount-warning');
        const minAmountValue   = document.getElementById('min-amount-value');

        // State
        let currentMinAmount= 0;
        let fetchAbortController = null;
        let trackingInterval = null;

        function updateSymbols() {
            document.getElementById('from-symbol').textContent = fromCurrency.value;
            document.getElementById('to-symbol').textContent   = toCurrency.value;
        }

        function updateReceiveAddressField() {
            const to    = toCurrency.value;
            const label = document.getElementById('receive-label');
            label.textContent = 'Receive Address (' + to + ')';
            const validation  = currencyValidation[to];
            receiveAddress.placeholder = validation ? validation.placeholder : 'Enter your wallet address';
            validateAddress(); 
        }

        function validateAddress() {
            const addr = receiveAddress.value.trim();
            const to = toCurrency.value;
            addressError.style.display = 'none';
            if (!addr) return true;
            
            if (currencyValidation[to]) {
                if (!currencyValidation[to].regex.test(addr)) {
                    addressError.textContent = `Invalid ${to} address format.`;
                    addressError.style.display = 'block';
                    return false;
                }
            } else if (addr.length < 20) {
                addressError.textContent = `Address too short.`;
                addressError.style.display = 'block';
                return false;
            }
            return true;
        }

        receiveAddress.addEventListener('input', validateAddress);

        function validateAmount() {
            const val = parseFloat(fromAmount.value);
            if (val && val < currentMinAmount) {
                minAmountWarning.style.color = 'var(--error)';
                submitBtn.disabled = true;
            } else {
                minAmountWarning.style.color = 'orange';
                submitBtn.disabled = false;
            }
        }

        fromAmount.addEventListener('input', validateAmount);

        async function fetchMinAmount() {
            const from = fromCurrency.value.toLowerCase();
            const to = toCurrency.value.toLowerCase();
            minAmountWarning.style.display = 'none';
            try {
                const endpoint = `https://api.changenow.io/v1/min-amount/${from}_${to}?api_key=${CONFIG.apiKey}`;
                const url = CONFIG.changenowBaseUrl + '?url=' + encodeURIComponent(endpoint);
                const res = await fetch(url);
                if (res.ok) {
                    const data = await res.json();
                    if (data.minAmount) {
                        currentMinAmount = data.minAmount;
                        minAmountValue.textContent = currentMinAmount + ' ' + fromCurrency.value;
                        minAmountWarning.style.display = 'block';
                        // check length to avoid auto-filling when user is typing
                        if (!fromAmount.value || parseFloat(fromAmount.value) === 0) {
                            fromAmount.value = currentMinAmount;
                        }
                        validateAmount();
                    }
                }
            } catch (e) {
                console.error("Failed to fetch min amount", e);
            }
        }

        async function fetchExchangeRate() {
            if (fetchAbortController) fetchAbortController.abort();
            fetchAbortController = new AbortController();
            
            const from   = fromCurrency.value;
            const to     = toCurrency.value;
            const amount = parseFloat(fromAmount.value) || Math.max(1, currentMinAmount);

            if (from === to) {
                toAmount.value = amount;
                exchangeRate.textContent = '1:1';
                return;
            }

            swapRate.textContent = 'Loading rates...';
            swapRate.style.color = 'var(--text-muted)';
            retryRateBtn.style.display = 'none';

            try {
                const timeout = setTimeout(() => fetchAbortController.abort(), 8000);
                
                // Get exact expected info from ChangeNOW including estimatedTime
                const exactEndpoint = `https://api.changenow.io/v1/exchange-amount/${parseFloat(amount)}/${from.toLowerCase()}_${to.toLowerCase()}/?api_key=${CONFIG.apiKey}`;
                const url = CONFIG.changenowBaseUrl + '?url=' + encodeURIComponent(exactEndpoint);
                
                const response = await fetch(url, { signal: fetchAbortController.signal });
                clearTimeout(timeout);
                
                if (!response.ok) throw new Error('HTTP ' + response.status);
                const data = await response.json();
                
                if (data.estimatedAmount) {
                    toAmount.value = data.estimatedAmount.toFixed(8);
                    const rate = data.estimatedAmount / amount;
                    exchangeRate.textContent  = '1 ' + from + ' ≈ ' + rate.toFixed(8) + ' ' + to;
                    swapRate.textContent      = '1 ' + from + ' ≈ ' + rate.toFixed(6) + ' ' + to;
                    networkFee.textContent    = data.networkFee ? `~${data.networkFee} ${to}` : 'Included';
                    
                    if (data.transactionSpeed) {
                        estimatedTime.textContent = `~${data.transactionSpeed} min`;
                    } else {
                        estimatedTime.textContent = '~15-30 min';
                    }
                } else {
                    throw new Error('No rate found');
                }
            } catch (error) {
                console.error('Error fetching rate:', error);
                if (error.name === 'AbortError' || error.message.includes('fetch')) {
                    swapRate.textContent = 'No se pudo obtener la tasa. Verifica tu conexión o intenta de nuevo.';
                    swapRate.style.color = 'var(--error)';
                    retryRateBtn.style.display = 'inline-block';
                } else {
                    exchangeRate.textContent = 'Error loading rate';
                    swapRate.textContent     = 'Rate unavailable';
                }
                networkFee.textContent   = '---';
                estimatedTime.textContent= '---';
                toAmount.value = '';
            }
        }

        retryRateBtn.addEventListener('click', fetchExchangeRate);

        async function createTransaction() {
            const from    = fromCurrency.value.toLowerCase();
            const to      = toCurrency.value.toLowerCase();
            const amount  = fromAmount.value;
            const address = receiveAddress.value.trim();

            if (!amount || parseFloat(amount) < currentMinAmount) {
                showResult('Please enter an amount greater than the minimum.', 'error');
                return;
            }
            if (!address || !validateAddress()) {
                showResult('Please enter a valid ' + toCurrency.value + ' address.', 'error');
                return;
            }

            submitBtn.disabled    = true;
            submitBtn.textContent = 'Processing...';

            try {
                const endpoint = 'https://api.changenow.io/v1/transactions/' + CONFIG.apiKey;
                const url = CONFIG.changenowBaseUrl + '?url=' + encodeURIComponent(endpoint);
                
                const body = {
                    from: from,
                    to:   to,
                    amount: parseFloat(amount),
                    address: address,
                    extraId: '',
                    userId: ''
                };
                
                const response = await fetch(url, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify(body)
                });
                
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || errorData.error || 'HTTP ' + response.status);
                }
                const data = await response.json();
                if (data.error) throw new Error(data.error);
                
                startTracking(data);

            } catch (error) {
                console.error('Error creating transaction:', error);
                showResult('Error: ' + (error.message || 'Please try again later'), 'error');
                submitBtn.disabled    = false;
                submitBtn.textContent = 'Swap Now';
            }
        }
        
        function startTracking(data) {
            swapWidget.style.display = 'none';
            trackingWidget.style.display = 'block';
            resultMessage.style.display = 'none';
            
            document.getElementById('track-id').textContent = data.id;
            document.getElementById('track-amount').textContent = `${data.expectedSendAmount || data.amount} ${fromCurrency.value}`;
            
            const copyLink = document.getElementById('track-address-copy');
            copyLink.textContent = data.payinAddress;
            copyLink.onclick = (e) => {
                e.preventDefault();
                navigator.clipboard.writeText(data.payinAddress);
                copyLink.textContent = 'Copied!';
                setTimeout(() => copyLink.textContent = data.payinAddress, 2000);
            };
            
            updateTrackingStatus(data.id);
            if (trackingInterval) clearInterval(trackingInterval);
            trackingInterval = setInterval(() => updateTrackingStatus(data.id), 15000);
        }
        
        async function updateTrackingStatus(id) {
            try {
                const endpoint = `https://api.changenow.io/v1/transactions/${id}/${CONFIG.apiKey}`;
                const url = CONFIG.changenowBaseUrl + '?url=' + encodeURIComponent(endpoint);
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    const statusSpan = document.getElementById('track-status');
                    const status = data.status || 'waiting';
                    
                    statusSpan.textContent = status.toUpperCase();
                    statusSpan.className = 'status-badge status-' + status.toLowerCase();
                    
                    if (status === 'finished' || status === 'failed' || status === 'refunded') {
                        clearInterval(trackingInterval);
                    }
                }
            } catch (e) {
                console.error('Tracking ping failed', e);
            }
        }
        
        document.getElementById('new-swap-btn').addEventListener('click', () => {
            if (trackingInterval) clearInterval(trackingInterval);
            trackingWidget.style.display = 'none';
            swapWidget.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Swap Now';
            fromAmount.value = currentMinAmount > 0 ? currentMinAmount : '';
            toAmount.value = '';
            receiveAddress.value = '';
            updateReceiveAddressField();
            fetchExchangeRate();
        });

        function showResult(message, type) {
            resultMessage.innerHTML = message;
            resultMessage.className = 'result-message ' + type;
        }

        function swapCurrencies() {
            const tempFrom   = fromCurrency.value;
            const tempTo     = toCurrency.value;
            fromCurrency.value = tempTo;
            toCurrency.value   = tempFrom;
            updateSymbols();
            updateReceiveAddressField();
            fetchMinAmount().then(fetchExchangeRate);
        }

        fromCurrency.addEventListener('change', () => { updateSymbols(); fetchMinAmount().then(fetchExchangeRate); });
        toCurrency.addEventListener('change', () => { updateSymbols(); updateReceiveAddressField(); fetchMinAmount().then(fetchExchangeRate); });
        
        let typingTimer;
        fromAmount.addEventListener('input', () => {
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                if (fromAmount.value && parseFloat(fromAmount.value) > 0) fetchExchangeRate();
            }, 600);
        });
        
        submitBtn.addEventListener('click', createTransaction);
        swapDirection.addEventListener('click', swapCurrencies);
        if(copyOnionBtn) {
            copyOnionBtn.addEventListener('click', () => {
                const onionAddress = document.querySelector('.onion-address span').textContent;
                navigator.clipboard.writeText(onionAddress).then(() => {
                    copyOnionBtn.textContent = 'Copied!';
                    copyOnionBtn.classList.add('copied');
                    setTimeout(() => {
                        copyOnionBtn.textContent = 'Copy Address';
                        copyOnionBtn.classList.remove('copied');
                    }, 2000);
                });
            });
        }

        // Modal Logic
        const tosModal     = document.getElementById('tos-modal');
        const privacyModal = document.getElementById('privacy-modal');
        const tosLink      = document.getElementById('tos-link');
        const privacyLink  = document.getElementById('privacy-link');
        const closeBtns    = document.querySelectorAll('.modal-close');

        function openModal(modal)  { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
        function closeModal(modal) { 
            modal.style.display = 'none'; 
            document.body.style.overflow = 'auto'; 
            if (window.location.hash === '#terms' || window.location.hash === '#privacy') {
                history.replaceState(null, null, ' ');
            }
        }

        tosLink.addEventListener('click', (e) => { e.preventDefault(); openModal(tosModal); });
        privacyLink.addEventListener('click', (e) => { e.preventDefault(); openModal(privacyModal); });
        closeBtns.forEach(function(btn) {
            btn.addEventListener('click', function() { closeModal(tosModal); closeModal(privacyModal); });
        });
        window.addEventListener('click', function(e) {
            if (e.target === tosModal)     closeModal(tosModal);
            if (e.target === privacyModal) closeModal(privacyModal);
        });
        
        // Handle URL hashes on load
        function checkHash() {
            if (window.location.hash === '#terms') openModal(tosModal);
            if (window.location.hash === '#privacy') openModal(privacyModal);
        }
        window.addEventListener('hashchange', checkHash);

        // Initialization
        updateSymbols();
        updateReceiveAddressField();
        fetchMinAmount().then(fetchExchangeRate);
        checkHash();
    