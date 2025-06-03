// Analytics module for sales dashboard and reporting
class Analytics {
    constructor() {
        this.charts = {
            hourly: null,
            topProducts: null
        };
        this.chartColors = {
            primary: '#D2691E',
            secondary: '#8B4513',
            accent: '#F4A460',
            success: '#2E7D32',
            danger: '#C62828',
            warning: '#F57C00'
        };
    }
    
    // Update dashboard with sales data
    updateDashboard(sales) {
        // Filter today's sales
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaySales = sales.filter(sale => {
            const saleDate = new Date(sale.date);
            saleDate.setHours(0, 0, 0, 0);
            return saleDate.getTime() === today.getTime();
        });
        
        // Calculate metrics
        this.updateSummaryCards(todaySales);
        this.updateHourlyChart(todaySales);
        this.updateTopProductsChart(todaySales);
        this.updateSalesTable(todaySales);
    }
    
    // Update summary cards
    updateSummaryCards(sales) {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalItems = sales.reduce((sum, sale) => 
            sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );
        const avgTransaction = sales.length > 0 ? totalRevenue / sales.length : 0;
        
        document.getElementById('todayRevenue').textContent = this.formatCurrency(totalRevenue);
        document.getElementById('todayItems').textContent = totalItems;
        document.getElementById('todayTransactions').textContent = sales.length;
        document.getElementById('avgTransaction').textContent = this.formatCurrency(avgTransaction);
    }
    
    // Update hourly sales chart
    updateHourlyChart(sales) {
        const ctx = document.getElementById('hourlyChart');
        if (!ctx) return;
        
        // Group sales by hour
        const hourlyData = Array(24).fill(0);
        
        sales.forEach(sale => {
            const hour = new Date(sale.date).getHours();
            hourlyData[hour] += sale.total;
        });
        
        // Destroy existing chart
        if (this.charts.hourly) {
            this.charts.hourly.destroy();
        }
        
        // Create new chart
        this.charts.hourly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Shitjet sipas orës',
                    data: hourlyData,
                    borderColor: this.chartColors.primary,
                    backgroundColor: this.hexToRgba(this.chartColors.primary, 0.1),
                    borderWidth: 3,
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointBackgroundColor: this.chartColors.primary,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `Shitje: ${this.formatCurrency(context.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: (value) => this.formatCurrency(value, true)
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Update top products chart
    updateTopProductsChart(sales) {
        const ctx = document.getElementById('topProductsChart');
        if (!ctx) return;
        
        // Count product sales
        const productCounts = {};
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!productCounts[item.name]) {
                    productCounts[item.name] = {
                        quantity: 0,
                        revenue: 0
                    };
                }
                productCounts[item.name].quantity += item.quantity;
                productCounts[item.name].revenue += item.price * item.quantity;
            });
        });
        
        // Sort by quantity and get top 10
        const sortedProducts = Object.entries(productCounts)
            .sort((a, b) => b[1].quantity - a[1].quantity)
            .slice(0, 10);
        
        // Destroy existing chart
        if (this.charts.topProducts) {
            this.charts.topProducts.destroy();
        }
        
        // Create new chart
        this.charts.topProducts = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sortedProducts.map(([name]) => this.truncateText(name, 15)),
                datasets: [{
                    label: 'Sasia e shitur',
                    data: sortedProducts.map(([_, data]) => data.quantity),
                    backgroundColor: this.generateGradientColors(sortedProducts.length),
                    borderColor: this.chartColors.primary,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => {
                                const [name, data] = sortedProducts[context.dataIndex];
                                return `Të ardhura: ${this.formatCurrency(data.revenue)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    }
    
    // Update sales table
    updateSalesTable(sales) {
        const salesTable = document.getElementById('salesTable');
        if (!salesTable) return;
        
        if (sales.length === 0) {
            salesTable.innerHTML = '<p class="text-center">Nuk ka shitje për të shfaqur</p>';
            return;
        }
        
        // Sort sales by date (newest first)
        const sortedSales = [...sales].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        salesTable.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Ora</th>
                        <th>Nr. Faturës</th>
                        <th>Artikuj</th>
                        <th>Total</th>
                        <th>Veprime</th>
                    </tr>
                </thead>
                <tbody>
                    ${sortedSales.map(sale => this.createSaleRow(sale)).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Create sale row HTML
    createSaleRow(sale) {
        const date = new Date(sale.date);
        const itemCount = sale.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return `
            <tr>
                <td>${date.toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}</td>
                <td>#${sale.id}</td>
                <td>${itemCount} artikuj</td>
                <td>${this.formatCurrency(sale.total)}</td>
                <td>
                    <button class="btn btn-secondary" style="padding: 4px 8px;" 
                            onclick="app.viewSaleDetails('${sale.id}')">
                        <span class="material-icons" style="font-size: 16px;">visibility</span>
                    </button>
                </td>
            </tr>
        `;
    }
    
    // Generate analytics report
    generateReport(sales, dateRange) {
        const report = {
            period: dateRange,
            generatedAt: new Date(),
            summary: this.calculateSummary(sales),
            hourlyBreakdown: this.calculateHourlyBreakdown(sales),
            productPerformance: this.calculateProductPerformance(sales),
            categoryAnalysis: this.calculateCategoryAnalysis(sales),
            peakHours: this.calculatePeakHours(sales),
            trends: this.calculateTrends(sales)
        };
        
        return report;
    }
    
    // Calculate summary statistics
    calculateSummary(sales) {
        const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
        const totalTax = sales.reduce((sum, sale) => sum + sale.tax, 0);
        const totalItems = sales.reduce((sum, sale) => 
            sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
        );
        
        return {
            totalSales: sales.length,
            totalRevenue,
            totalTax,
            totalItems,
            averageTransaction: sales.length > 0 ? totalRevenue / sales.length : 0,
            averageItemsPerSale: sales.length > 0 ? totalItems / sales.length : 0
        };
    }
    
    // Calculate hourly breakdown
    calculateHourlyBreakdown(sales) {
        const hourly = Array(24).fill(null).map(() => ({
            sales: 0,
            revenue: 0,
            items: 0
        }));
        
        sales.forEach(sale => {
            const hour = new Date(sale.date).getHours();
            hourly[hour].sales++;
            hourly[hour].revenue += sale.total;
            hourly[hour].items += sale.items.reduce((sum, item) => sum + item.quantity, 0);
        });
        
        return hourly;
    }
    
    // Calculate product performance
    calculateProductPerformance(sales) {
        const products = {};
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                if (!products[item.name]) {
                    products[item.name] = {
                        name: item.name,
                        quantity: 0,
                        revenue: 0,
                        transactions: 0
                    };
                }
                
                products[item.name].quantity += item.quantity;
                products[item.name].revenue += item.price * item.quantity;
                products[item.name].transactions++;
            });
        });
        
        // Convert to array and sort by revenue
        return Object.values(products).sort((a, b) => b.revenue - a.revenue);
    }
    
    // Calculate category analysis
    calculateCategoryAnalysis(sales) {
        const categories = {};
        
        sales.forEach(sale => {
            sale.items.forEach(item => {
                const category = item.category || 'të tjera';
                
                if (!categories[category]) {
                    categories[category] = {
                        category,
                        quantity: 0,
                        revenue: 0,
                        percentage: 0
                    };
                }
                
                categories[category].quantity += item.quantity;
                categories[category].revenue += item.price * item.quantity;
            });
        });
        
        // Calculate percentages
        const totalRevenue = Object.values(categories)
            .reduce((sum, cat) => sum + cat.revenue, 0);
        
        Object.values(categories).forEach(cat => {
            cat.percentage = totalRevenue > 0 ? (cat.revenue / totalRevenue) * 100 : 0;
        });
        
        return Object.values(categories);
    }
    
    // Calculate peak hours
    calculatePeakHours(sales) {
        const hourlyData = this.calculateHourlyBreakdown(sales);
        
        // Find top 3 hours by revenue
        const peakHours = hourlyData
            .map((data, hour) => ({ hour, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 3)
            .map(data => ({
                hour: `${data.hour}:00 - ${data.hour + 1}:00`,
                revenue: data.revenue,
                sales: data.sales
            }));
        
        return peakHours;
    }
    
    // Calculate trends
    calculateTrends(sales) {
        // Group by date
        const dailyData = {};
        
        sales.forEach(sale => {
            const date = new Date(sale.date).toISOString().split('T')[0];
            
            if (!dailyData[date]) {
                dailyData[date] = {
                    date,
                    revenue: 0,
                    sales: 0
                };
            }
            
            dailyData[date].revenue += sale.total;
            dailyData[date].sales++;
        });
        
        // Convert to array and sort by date
        const sortedData = Object.values(dailyData)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Calculate growth
        if (sortedData.length >= 2) {
            const latest = sortedData[sortedData.length - 1];
            const previous = sortedData[sortedData.length - 2];
            
            return {
                revenueGrowth: ((latest.revenue - previous.revenue) / previous.revenue) * 100,
                salesGrowth: ((latest.sales - previous.sales) / previous.sales) * 100,
                dailyData: sortedData
            };
        }
        
        return {
            revenueGrowth: 0,
            salesGrowth: 0,
            dailyData: sortedData
        };
    }
    
    // Export report as PDF (simplified version)
    exportReportAsPDF(report) {
        // In a real implementation, would use a library like jsPDF
        // For now, create a printable HTML version
        const reportHTML = this.generateReportHTML(report);
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        printWindow.print();
    }
    
    // Generate report HTML
    generateReportHTML(report) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Raporti i Shitjeve - ${report.period}</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #8B4513; }
                    h2 { color: #D2691E; margin-top: 30px; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #f4f4f4; }
                    .metric { font-size: 24px; font-weight: bold; color: #2E7D32; }
                </style>
            </head>
            <body>
                <h1>Raporti i Shitjeve</h1>
                <p>Periudha: ${report.period}</p>
                <p>Gjeneruar: ${new Date(report.generatedAt).toLocaleString('sq-AL')}</p>
                
                <h2>Përmbledhje</h2>
                <p>Shitje totale: <span class="metric">${report.summary.totalSales}</span></p>
                <p>Të ardhura totale: <span class="metric">${this.formatCurrency(report.summary.totalRevenue)}</span></p>
                <p>Artikuj të shitur: <span class="metric">${report.summary.totalItems}</span></p>
                
                <h2>Produktet më të shitura</h2>
                <table>
                    <tr>
                        <th>Produkti</th>
                        <th>Sasia</th>
                        <th>Të ardhura</th>
                    </tr>
                    ${report.productPerformance.slice(0, 10).map(product => `
                        <tr>
                            <td>${product.name}</td>
                            <td>${product.quantity}</td>
                            <td>${this.formatCurrency(product.revenue)}</td>
                        </tr>
                    `).join('')}
                </table>
                
                <h2>Orët më të ngarkuara</h2>
                ${report.peakHours.map(peak => `
                    <p>${peak.hour}: ${this.formatCurrency(peak.revenue)} (${peak.sales} shitje)</p>
                `).join('')}
            </body>
            </html>
        `;
    }
    
    // Utility functions
    formatCurrency(amount, short = false) {
        if (short && amount >= 1000) {
            return (amount / 1000).toFixed(1) + 'k';
        }
        return amount.toFixed(0) + ' Lek';
    }
    
    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substr(0, maxLength) + '...' : text;
    }
    
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    generateGradientColors(count) {
        const colors = [];
        const startColor = this.chartColors.accent;
        const endColor = this.chartColors.primary;
        
        for (let i = 0; i < count; i++) {
            const ratio = i / (count - 1);
            const color = this.interpolateColor(startColor, endColor, ratio);
            colors.push(color);
        }
        
        return colors;
    }
    
    interpolateColor(color1, color2, ratio) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `rgb(${r}, ${g}, ${b})`;
    }
}

// Export for use in main app
window.Analytics = Analytics;