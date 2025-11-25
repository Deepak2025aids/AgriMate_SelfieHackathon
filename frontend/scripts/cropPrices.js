/* ========================================
   AGRIMATE - Crop Prices Management
   Dynamic pricing from database
   ======================================== */

class CropPricesManager {
    constructor() {
        this.pricesGrid = document.getElementById('pricesGrid');
        this.stateSelect = document.getElementById('stateSelect');
        this.districtSelect = document.getElementById('districtSelect');
        this.apiUrl = 'http://localhost:3000/api';
        this.prices = [];
        this.init();
    }

    init() {
        try {
            if (this.stateSelect && this.districtSelect && this.pricesGrid) {
                this.stateSelect.addEventListener('change', (e) => this.onStateChange(e));
                this.districtSelect.addEventListener('change', () => this.loadPrices());
                this.loadPrices();
                console.log('✓ Crop Prices Manager initialized');
            } else {
                console.warn('⚠ Missing DOM elements for Crop Prices Manager');
            }
        } catch (error) {
            console.error('✗ Crop Prices Manager error:', error);
        }
    }

    onStateChange(event) {
        try {
            const state = event.target.value;
            this.updateDistricts(state);
            this.loadPrices();
        } catch (error) {
            console.error('Error on state change:', error);
        }
    }

    updateDistricts(state) {
        try {
            const districts = {
                'tamil-nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruppur', 'Erode', 'Salem'],
                'karnataka': ['Bangalore', 'Mysore', 'Belgaum', 'Hubli', 'Mangalore'],
                'maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Aurangabad', 'Nashik'],
                'punjab': ['Amritsar', 'Ludhiana', 'Jalandhar', 'Patiala', 'Bathinda'],
                'rajasthan': ['Jaipur', 'Jodhpur', 'Ajmer', 'Bikaner', 'Kota']
            };

            const districtList = districts[state] || [];
            if (this.districtSelect) {
                this.districtSelect.innerHTML = '<option value="">Select District</option>';

                districtList.forEach(district => {
                    const option = document.createElement('option');
                    option.value = district;
                    option.textContent = district;
                    this.districtSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error updating districts:', error);
        }
    }

    loadPrices() {
        try {
            if (!this.pricesGrid) return;

            const state = this.stateSelect ? this.stateSelect.value : '';
            const district = this.districtSelect ? this.districtSelect.value : '';

            // Show loading state
            this.pricesGrid.innerHTML = '<div class="loading-message">Loading prices...</div>';

            // Try to fetch from server, fallback to mock data
            this.fetchPricesFromServer(state, district)
                .catch(() => {
                    console.log('Server unavailable, using mock data');
                    return this.getMockPrices(state, district);
                })
                .then(prices => this.displayPrices(prices))
                .catch(error => {
                    console.error('Error in price loading:', error);
                    this.pricesGrid.innerHTML = '<p>Error loading prices. Using sample data...</p>';
                    this.displayPrices(this.getMockPricesSync(state, district));
                });

        } catch (error) {
            console.error('Error loading prices:', error);
            if (this.pricesGrid) {
                this.pricesGrid.innerHTML = '<p>Error loading prices. Please try again.</p>';
            }
        }
    }

    fetchPricesFromServer(state, district) {
        return fetch(`${this.apiUrl}/prices?state=${state}&district=${district}`)
            .then(res => {
                if (!res.ok) throw new Error('Server error');
                return res.json();
            });
    }

    getMockPrices(state, district) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(this.getMockPricesSync(state, district));
            }, 500);
        });
    }

    getMockPricesSync(state, district) {
        const mockData = {
            'tamil-nadu': {
                'Chennai': [
                    { id: 1, crop: 'Rice', price: 2500, unit: '50kg', market: 'Koyambedu Market', trend: '↑', change: '+5%' },
                    { id: 2, crop: 'Coconut', price: 1800, unit: '100pcs', market: 'Koyambedu Market', trend: '↓', change: '-2%' },
                    { id: 3, crop: 'Sugarcane', price: 3200, unit: '100kg', market: 'Chennai Market', trend: '↑', change: '+3%' },
                    { id: 4, crop: 'Onion', price: 2000, unit: '50kg', market: 'Koyambedu Market', trend: '↑', change: '+4%' }
                ],
                'Coimbatore': [
                    { id: 5, crop: 'Rice', price: 2400, unit: '50kg', market: 'Coimbatore APMC', trend: '↑', change: '+3%' },
                    { id: 6, crop: 'Cotton', price: 5800, unit: '100kg', market: 'Coimbatore Market', trend: '↑', change: '+6%' },
                    { id: 7, crop: 'Potato', price: 1800, unit: '50kg', market: 'Coimbatore Market', trend: '→', change: '0%' },
                    { id: 8, crop: 'Tomato', price: 1200, unit: '50kg', market: 'Coimbatore Market', trend: '↓', change: '-1%' }
                ],
                'Madurai': [
                    { id: 9, crop: 'Rice', price: 2300, unit: '50kg', market: 'Madurai Market', trend: '→', change: '0%' },
                    { id: 10, crop: 'Turmeric', price: 6500, unit: '50kg', market: 'Madurai Market', trend: '↑', change: '+2%' },
                    { id: 11, crop: 'Corn', price: 1900, unit: '50kg', market: 'Madurai Market', trend: '↑', change: '+1%' }
                ],
                'Tiruppur': [
                    { id: 12, crop: 'Rice', price: 2450, unit: '50kg', market: 'Tiruppur Market', trend: '↑', change: '+4%' },
                    { id: 13, crop: 'Groundnut', price: 5200, unit: '50kg', market: 'Tiruppur Market', trend: '↑', change: '+3%' }
                ],
                'Erode': [
                    { id: 14, crop: 'Rice', price: 2380, unit: '50kg', market: 'Erode Market', trend: '↓', change: '-2%' },
                    { id: 15, crop: 'Pepper', price: 8200, unit: '50kg', market: 'Erode Market', trend: '↑', change: '+5%' }
                ],
                'Salem': [
                    { id: 16, crop: 'Rice', price: 2420, unit: '50kg', market: 'Salem Market', trend: '↑', change: '+2%' },
                    { id: 17, crop: 'Sugarcane', price: 3100, unit: '100kg', market: 'Salem Market', trend: '→', change: '0%' }
                ]
            },
            'karnataka': {
                'Bangalore': [
                    { id: 18, crop: 'Rice', price: 2600, unit: '50kg', market: 'Bangalore Market', trend: '↑', change: '+4%' },
                    { id: 19, crop: 'Coffee', price: 8500, unit: '50kg', market: 'Bangalore Market', trend: '↑', change: '+4%' },
                    { id: 20, crop: 'Cardamom', price: 12000, unit: '50kg', market: 'Bangalore Market', trend: '↑', change: '+2%' },
                    { id: 21, crop: 'Maize', price: 2000, unit: '50kg', market: 'Bangalore Market', trend: '↓', change: '-1%' }
                ],
                'Mysore': [
                    { id: 22, crop: 'Rice', price: 2550, unit: '50kg', market: 'Mysore Market', trend: '↑', change: '+2%' },
                    { id: 23, crop: 'Silk', price: 15000, unit: '50kg', market: 'Mysore Market', trend: '↑', change: '+3%' },
                    { id: 24, crop: 'Sugarcane', price: 3150, unit: '100kg', market: 'Mysore Market', trend: '↑', change: '+2%' }
                ],
                'Belgaum': [
                    { id: 25, crop: 'Jowar', price: 2200, unit: '50kg', market: 'Belgaum Market', trend: '→', change: '0%' },
                    { id: 26, crop: 'Corn', price: 1950, unit: '50kg', market: 'Belgaum Market', trend: '↑', change: '+1%' }
                ],
                'Hubli': [
                    { id: 27, crop: 'Groundnut', price: 5300, unit: '50kg', market: 'Hubli Market', trend: '↑', change: '+2%' },
                    { id: 28, crop: 'Cotton', price: 5900, unit: '100kg', market: 'Hubli Market', trend: '↑', change: '+4%' }
                ],
                'Mangalore': [
                    { id: 29, crop: 'Coconut', price: 1900, unit: '100pcs', market: 'Mangalore Market', trend: '↑', change: '+3%' },
                    { id: 30, crop: 'Rice', price: 2700, unit: '50kg', market: 'Mangalore Market', trend: '↑', change: '+5%' }
                ]
            },
            'maharashtra': {
                'Mumbai': [
                    { id: 31, crop: 'Rice', price: 2700, unit: '50kg', market: 'Mumbai APMC', trend: '↑', change: '+6%' },
                    { id: 32, crop: 'Onion', price: 2200, unit: '50kg', market: 'Mumbai Market', trend: '↑', change: '+5%' },
                    { id: 33, crop: 'Sugarcane', price: 3400, unit: '100kg', market: 'Mumbai Market', trend: '↑', change: '+4%' }
                ],
                'Pune': [
                    { id: 34, crop: 'Rice', price: 2650, unit: '50kg', market: 'Pune Market', trend: '↑', change: '+3%' },
                    { id: 35, crop: 'Jowar', price: 2300, unit: '50kg', market: 'Pune Market', trend: '↑', change: '+2%' },
                    { id: 36, crop: 'Corn', price: 2050, unit: '50kg', market: 'Pune Market', trend: '→', change: '0%' }
                ],
                'Nagpur': [
                    { id: 37, crop: 'Orange', price: 3500, unit: '50kg', market: 'Nagpur Market', trend: '↑', change: '+4%' },
                    { id: 38, crop: 'Cotton', price: 6000, unit: '100kg', market: 'Nagpur Market', trend: '↑', change: '+3%' }
                ],
                'Aurangabad': [
                    { id: 39, crop: 'Sugarcane', price: 3300, unit: '100kg', market: 'Aurangabad Market', trend: '↑', change: '+3%' },
                    { id: 40, crop: 'Cotton', price: 5950, unit: '100kg', market: 'Aurangabad Market', trend: '↑', change: '+2%' }
                ],
                'Nashik': [
                    { id: 41, crop: 'Grape', price: 4500, unit: '50kg', market: 'Nashik Market', trend: '↑', change: '+4%' },
                    { id: 42, crop: 'Sugarcane', price: 3250, unit: '100kg', market: 'Nashik Market', trend: '↑', change: '+2%' }
                ]
            },
            'punjab': {
                'Amritsar': [
                    { id: 43, crop: 'Rice', price: 2200, unit: '50kg', market: 'Amritsar Mandi', trend: '↓', change: '-1%' },
                    { id: 44, crop: 'Wheat', price: 2400, unit: '50kg', market: 'Amritsar Mandi', trend: '↑', change: '+2%' },
                    { id: 45, crop: 'Cotton', price: 5700, unit: '100kg', market: 'Amritsar Market', trend: '↑', change: '+3%' }
                ],
                'Ludhiana': [
                    { id: 46, crop: 'Wheat', price: 2100, unit: '50kg', market: 'Ludhiana Mandi', trend: '→', change: '0%' },
                    { id: 47, crop: 'Rice', price: 2250, unit: '50kg', market: 'Ludhiana Market', trend: '↑', change: '+1%' },
                    { id: 48, crop: 'Corn', price: 1850, unit: '50kg', market: 'Ludhiana Market', trend: '↓', change: '-2%' }
                ],
                'Jalandhar': [
                    { id: 49, crop: 'Rice', price: 2300, unit: '50kg', market: 'Jalandhar Market', trend: '↑', change: '+2%' },
                    { id: 50, crop: 'Potato', price: 1700, unit: '50kg', market: 'Jalandhar Market', trend: '↓', change: '-3%' }
                ],
                'Patiala': [
                    { id: 51, crop: 'Wheat', price: 2150, unit: '50kg', market: 'Patiala Market', trend: '↑', change: '+1%' },
                    { id: 52, crop: 'Rice', price: 2280, unit: '50kg', market: 'Patiala Market', trend: '→', change: '0%' }
                ],
                'Bathinda': [
                    { id: 53, crop: 'Cotton', price: 5650, unit: '100kg', market: 'Bathinda Market', trend: '↑', change: '+4%' },
                    { id: 54, crop: 'Wheat', price: 2050, unit: '50kg', market: 'Bathinda Market', trend: '→', change: '0%' }
                ]
            },
            'rajasthan': {
                'Jaipur': [
                    { id: 55, crop: 'Rice', price: 2350, unit: '50kg', market: 'Jaipur Market', trend: '→', change: '+1%' },
                    { id: 56, crop: 'Mustard', price: 4200, unit: '50kg', market: 'Jaipur Market', trend: '↑', change: '+3%' },
                    { id: 57, crop: 'Corn', price: 1900, unit: '50kg', market: 'Jaipur Market', trend: '↑', change: '+2%' }
                ],
                'Jodhpur': [
                    { id: 58, crop: 'Groundnut', price: 5200, unit: '50kg', market: 'Jodhpur Market', trend: '↑', change: '+5%' },
                    { id: 59, crop: 'Cumin', price: 9500, unit: '50kg', market: 'Jodhpur Market', trend: '↑', change: '+4%' }
                ],
                'Ajmer': [
                    { id: 60, crop: 'Mustard', price: 4300, unit: '50kg', market: 'Ajmer Market', trend: '↑', change: '+4%' },
                    { id: 61, crop: 'Rice', price: 2400, unit: '50kg', market: 'Ajmer Market', trend: '↑', change: '+3%' }
                ],
                'Bikaner': [
                    { id: 62, crop: 'Cumin', price: 9300, unit: '50kg', market: 'Bikaner Market', trend: '↓', change: '-1%' },
                    { id: 63, crop: 'Mustard', price: 4150, unit: '50kg', market: 'Bikaner Market', trend: '→', change: '0%' }
                ],
                'Kota': [
                    { id: 64, crop: 'Cotton', price: 5800, unit: '100kg', market: 'Kota Market', trend: '↑', change: '+3%' },
                    { id: 65, crop: 'Soybean', price: 3800, unit: '50kg', market: 'Kota Market', trend: '↑', change: '+2%' }
                ]
            }
        };

        // Find matching prices
        const stateData = mockData[state] || {};
        let prices = [];

        if (district) {
            prices = stateData[district] || [];
        }

        // Fallback: if no specific district prices, show state-wide
        if (!prices || prices.length === 0) {
            prices = Object.values(stateData).flat() || mockData['tamil-nadu']['Chennai'] || [];
        }

        return prices || [];
    }

    displayPrices(prices) {
        try {
            if (!this.pricesGrid) return;

            if (!prices || prices.length === 0) {
                this.pricesGrid.innerHTML = '<p class="no-data">No prices available for this location. Try selecting a different state or district.</p>';
                return;
            }

            const pricesHTML = prices.map(price => `
                <div class="price-card">
                    <h3 class="price-crop">${price.crop || 'N/A'}</h3>
                    <div class="price-row">
                        <span class="price-label">Price:</span>
                        <span class="price-value">₹${(price.price || 0).toLocaleString()}</span>
                    </div>
                    <div class="price-row">
                        <span class="price-label">Unit:</span>
                        <span>${price.unit || 'N/A'}</span>
                    </div>
                    <div class="price-row">
                        <span class="price-label">Market:</span>
                        <span>${price.market || 'N/A'}</span>
                    </div>
                    <div class="price-row">
                        <span class="price-label">Trend:</span>
                        <span class="trend-badge" style="color: ${price.trend === '↑' ? '#27ae60' : price.trend === '↓' ? '#e74c3c' : '#95a5a6'}">
                            ${price.trend || '→'} ${price.change || '0%'}
                        </span>
                    </div>
                </div>
            `).join('');

            this.pricesGrid.innerHTML = pricesHTML;

            // Cache prices
            this.cachePrices(prices);

            console.log(`✓ Displayed ${prices.length} prices`);

        } catch (error) {
            console.error('Error displaying prices:', error);
            if (this.pricesGrid) {
                this.pricesGrid.innerHTML = '<p>Error displaying prices</p>';
            }
        }
    }

    cachePrices(prices) {
        try {
            const cache = {
                timestamp: new Date(),
                prices: prices,
                state: this.stateSelect ? this.stateSelect.value : '',
                district: this.districtSelect ? this.districtSelect.value : ''
            };
            localStorage.setItem('agrimate-prices-cache', JSON.stringify(cache));
        } catch (error) {
            console.error('Error caching prices:', error);
        }
    }

    loadCachedPrices() {
        try {
            const cached = localStorage.getItem('agrimate-prices-cache');
            if (cached) {
                const data = JSON.parse(cached);
                const timestamp = new Date(data.timestamp);
                const now = new Date();

                // Show cache if less than 24 hours old
                if ((now - timestamp) < 86400000) {
                    return data.prices;
                }
            }
        } catch (error) {
            console.error('Error loading cached prices:', error);
        }
        return [];
    }

    getPriceByRegion(region) {
        try {
            return this.prices.filter(p => p.region === region);
        } catch (error) {
            console.error('Error getting prices by region:', error);
            return [];
        }
    }
}

// Initialize crop prices manager when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const cropPricesManager = new CropPricesManager();
    });
} else {
    const cropPricesManager = new CropPricesManager();
}
