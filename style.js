/**
 * =========================================================================
 * Medical Care - Medical Supplies & Profit Management System
 * نظام ميديكال كير لإدارة المستلزمات الطبية والأرباح والمخازن
 * =========================================================================
 */

// Initial Seed Data for Medical Supplies
const INITIAL_PRODUCTS = [
    
];

const INITIAL_SALES = [
    
];

// App State
let products = [];
let sales = [];

// DOM Elements
const inventoryTableBody = document.getElementById("inventoryTableBody");
const inventoryEmptyState = document.getElementById("inventoryEmptyState");
const salesTableBody = document.getElementById("salesTableBody");
const salesEmptyState = document.getElementById("salesEmptyState");

const searchInput = document.getElementById("searchInput");
const clearSearchBtn = document.getElementById("clearSearchBtn");
const filterCompany = document.getElementById("filterCompany");
const filterStatus = document.getElementById("filterStatus");
const sortBy = document.getElementById("sortBy");

// KPI Elements
const kpiTotalPurchases = document.getElementById("kpiTotalPurchases");
const kpiTotalSales = document.getElementById("kpiTotalSales");
const kpiTotalSoldUnits = document.getElementById("kpiTotalSoldUnits");
const kpiNetProfit = document.getElementById("kpiNetProfit");
const kpiProfitMargin = document.getElementById("kpiProfitMargin");
const kpiProfitCard = document.getElementById("kpiProfitCard");
const kpiTotalItemsCount = document.getElementById("kpiTotalItemsCount");
const kpiRemainingPieces = document.getElementById("kpiRemainingPieces");
const kpiLowStockCount = document.getElementById("kpiLowStockCount");

const footerItemsCount = document.getElementById("footerItemsCount");
const footerTotalStockValue = document.getElementById("footerTotalStockValue");
const footerTotalExpectedProfit = document.getElementById("footerTotalExpectedProfit");

const badgeInventoryCount = document.getElementById("badgeInventoryCount");
const badgeSalesCount = document.getElementById("badgeSalesCount");

// Product Modal & Form
const productModal = document.getElementById("productModal");
const productForm = document.getElementById("productForm");
const productModalTitle = document.getElementById("productModalTitle");
const editProductId = document.getElementById("editProductId");

const inputName = document.getElementById("inputName");
const inputCompany = document.getElementById("inputCompany");
const inputDate = document.getElementById("inputDate");
const inputQty = document.getElementById("inputQty");
const inputPiecesPerPack = document.getElementById("inputPiecesPerPack");
const inputBuyPrice = document.getElementById("inputBuyPrice");
const inputSellPrice = document.getElementById("inputSellPrice");
const inputDiscount = document.getElementById("inputDiscount");
const inputNotes = document.getElementById("inputNotes");

// Live Calc preview elements in Product Modal
const calcNetSellPrice = document.getElementById("calcNetSellPrice");
const calcUnitProfit = document.getElementById("calcUnitProfit");
const calcTotalCost = document.getElementById("calcTotalCost");
const calcTotalProfit = document.getElementById("calcTotalProfit");
const calcWarningAlert = document.getElementById("calcWarningAlert");
const calcLossAmount = document.getElementById("calcLossAmount");

// Sell Modal & Form
const sellModal = document.getElementById("sellModal");
const sellForm = document.getElementById("sellForm");
const sellProductId = document.getElementById("sellProductId");
const sellModalProductName = document.getElementById("sellModalProductName");
const sellModalCompany = document.getElementById("sellModalCompany");
const sellModalAvailableQty = document.getElementById("sellModalAvailableQty");
const sellModalBuyPrice = document.getElementById("sellModalBuyPrice");
const sellQty = document.getElementById("sellQty");
const sellUnitPrice = document.getElementById("sellUnitPrice");
const sellDiscount = document.getElementById("sellDiscount");
const sellCustomer = document.getElementById("sellCustomer");
const sellMaxQtyHint = document.getElementById("sellMaxQtyHint");
const sellTotalBill = document.getElementById("sellTotalBill");
const sellTotalCost = document.getElementById("sellTotalCost");
const sellNetProfit = document.getElementById("sellNetProfit");
const sellProfitLabel = document.getElementById("sellProfitLabel");

// Theme & Navigation
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");

// =========================================================================
// Initialization & LocalStorage
// =========================================================================
function initApp() {
    loadTheme();
    loadData();
    setupEventListeners();
    renderAll();
    
    // Set default date for today in add form
    const today = new Date().toISOString().split('T')[0];
    inputDate.value = today;
}

function loadData() {
    const savedProducts = localStorage.getItem("medical_products_v2");
    const savedSales = localStorage.getItem("medical_sales_v2");

    if (savedProducts) {
        try {
            products = JSON.parse(savedProducts);
        } catch (e) {
            products = [...INITIAL_PRODUCTS];
        }
    } else {
        products = [...INITIAL_PRODUCTS];
        saveProducts();
    }

    if (savedSales) {
        try {
            sales = JSON.parse(savedSales);
        } catch (e) {
            sales = [...INITIAL_SALES];
        }
    } else {
        sales = [...INITIAL_SALES];
        saveSales();
    }
}

function saveProducts() {
    localStorage.setItem("medical_products_v2", JSON.stringify(products));
}

function saveSales() {
    localStorage.setItem("medical_sales_v2", JSON.stringify(sales));
}

// =========================================================================
// Rendering Functions
// =========================================================================
function renderAll() {
    renderKPIs();
    renderCompanyFilterOptions();
    renderInventoryTable();
    renderSalesTable();
    renderAnalytics();
}

/**
 * Update Key Performance Indicators (KPIs)
 */
function renderKPIs() {
    // 1. Total Purchases Cost
    const totalPurchasesCost = products.reduce((acc, p) => acc + (Number(p.initialQty || 0) * Number(p.buyPrice || 0)), 0);
    kpiTotalPurchases.textContent = formatCurrency(totalPurchasesCost);

    // 2. Total Sales & Realized Net Profit
    const totalSalesRevenue = sales.reduce((acc, s) => acc + Number(s.totalBill || 0), 0);
    const totalSoldPieces = sales.reduce((acc, s) => acc + Number(s.qty || 0), 0);
    const totalNetProfit = sales.reduce((acc, s) => acc + Number(s.netProfit || 0), 0);

    kpiTotalSales.textContent = formatCurrency(totalSalesRevenue);
    kpiTotalSoldUnits.textContent = `باعت ${totalSoldPieces} قطعة عبر ${sales.length} عملية بيع`;

    kpiNetProfit.textContent = formatCurrency(totalNetProfit);
    
    // Profit margin percentage
    let margin = 0;
    if (totalSalesRevenue > 0) {
        margin = ((totalNetProfit / totalSalesRevenue) * 100).toFixed(1);
    }
    
    if (totalNetProfit >= 0) {
        kpiNetProfit.className = "stat-value text-success";
        kpiProfitMargin.textContent = `هامش الربح المحقق: ${margin}%`;
        kpiProfitCard.className = "stat-card card-green";
    } else {
        kpiNetProfit.className = "stat-value text-danger";
        kpiProfitMargin.textContent = `نسبة الخسارة المحققة: ${Math.abs(margin)}%`;
        kpiProfitCard.className = "stat-card card-rose";
    }

    // 3. Stock counts
    const totalItems = products.length;
    const totalRemainingPieces = products.reduce((acc, p) => {
        const remaining = Number(p.initialQty || 0) - Number(p.soldQty || 0);
        return acc + (remaining > 0 ? remaining : 0);
    }, 0);

    kpiTotalItemsCount.textContent = totalItems;
    kpiRemainingPieces.textContent = `المتبقي: ${totalRemainingPieces} قطعة بالرفوف`;

    // 4. Low stock warnings (items <= 5 pieces)
    const lowStockItems = products.filter(p => {
        const remaining = Number(p.initialQty || 0) - Number(p.soldQty || 0);
        return remaining <= 5;
    });
    kpiLowStockCount.textContent = lowStockItems.length;

    // Badges on tabs
    badgeInventoryCount.textContent = totalItems;
    badgeSalesCount.textContent = sales.length;
}

/**
 * Render dynamic list of supplier companies in the filter dropdown
 */
function renderCompanyFilterOptions() {
    const currentVal = filterCompany.value;
    const companies = Array.from(new Set(products.map(p => p.company.trim()).filter(Boolean))).sort();

    filterCompany.innerHTML = `<option value="">جميع الشركات الموردة (${companies.length})</option>`;
    companies.forEach(company => {
        const option = document.createElement("option");
        option.value = company;
        option.textContent = company;
        if (company === currentVal) option.selected = true;
        filterCompany.appendChild(option);
    });
}

/**
 * Render Main Inventory Table with search, company filter, status filter, and sorting
 */
function renderInventoryTable() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    const selectedCompany = filterCompany.value;
    const selectedStatus = filterStatus.value;
    const sortOption = sortBy.value;

    // Filter
    let filtered = products.filter(product => {
        const remaining = Number(product.initialQty || 0) - Number(product.soldQty || 0);

        // Search match
        const matchesSearch = !searchTerm ||
            product.name.toLowerCase().includes(searchTerm) ||
            product.company.toLowerCase().includes(searchTerm) ||
            (product.notes && product.notes.toLowerCase().includes(searchTerm));

        // Company filter
        const matchesCompany = !selectedCompany || product.company === selectedCompany;

        // Stock status filter
        let matchesStatus = true;
        if (selectedStatus === "available") {
            matchesStatus = remaining > 5;
        } else if (selectedStatus === "low") {
            matchesStatus = remaining > 0 && remaining <= 5;
        } else if (selectedStatus === "out") {
            matchesStatus = remaining <= 0;
        }

        return matchesSearch && matchesCompany && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
        const remA = Number(a.initialQty || 0) - Number(a.soldQty || 0);
        const remB = Number(b.initialQty || 0) - Number(b.soldQty || 0);
        const profitA = (Number(a.sellPrice) - Number(a.discount || 0)) - Number(a.buyPrice);
        const profitB = (Number(b.sellPrice) - Number(b.discount || 0)) - Number(b.buyPrice);

        switch (sortOption) {
            case "date-desc":
                return new Date(b.date) - new Date(a.date);
            case "date-asc":
                return new Date(a.date) - new Date(b.date);
            case "profit-desc":
                return profitB - profitA;
            case "qty-desc":
                return remB - remA;
            case "qty-asc":
                return remA - remB;
            case "name-asc":
                return a.name.localeCompare(b.name, 'ar');
            default:
                return 0;
        }
    });

    // Populate Table Body
    inventoryTableBody.innerHTML = "";

    if (filtered.length === 0) {
        inventoryEmptyState.style.display = "block";
    } else {
        inventoryEmptyState.style.display = "none";
    }

    let displayedStockValue = 0;
    let displayedExpectedProfit = 0;

    filtered.forEach((item, index) => {
        const remaining = Math.max(0, Number(item.initialQty || 0) - Number(item.soldQty || 0));
        const netSellPrice = Math.max(0, Number(item.sellPrice) - Number(item.discount || 0));
        const unitProfit = netSellPrice - Number(item.buyPrice);
        const totalExpectedProfit = unitProfit * remaining;

        displayedStockValue += remaining * Number(item.buyPrice);
        displayedExpectedProfit += totalExpectedProfit;

        // Stock status badge
        let stockBadgeHtml = "";
        if (remaining <= 0) {
            stockBadgeHtml = `<span class="badge-tag badge-danger"><i class="fa-solid fa-circle-xmark"></i> نفد المخزون</span>`;
        } else if (remaining <= 5) {
            stockBadgeHtml = `<span class="badge-tag badge-warning"><i class="fa-solid fa-triangle-exclamation"></i> قارب على النفاد (${remaining})</span>`;
        } else {
            stockBadgeHtml = `<span class="badge-tag badge-success"><i class="fa-solid fa-circle-check"></i> متوفر (${remaining})</span>`;
        }

        // Unit Profit markup (loss vs profit)
        let unitProfitHtml = "";
        if (unitProfit > 0) {
            unitProfitHtml = `<span class="profit-text">+${formatCurrency(unitProfit)}</span>`;
        } else if (unitProfit < 0) {
            unitProfitHtml = `<span class="loss-text">${formatCurrency(unitProfit)} (خسارة)</span>`;
        } else {
            unitProfitHtml = `<span>0.00 ج.م</span>`;
        }

        const tr = document.createElement("tr");
        if (unitProfit < 0) tr.classList.add("row-loss");

        tr.innerHTML = `
            <td style="font-weight: 700; color: var(--text-muted);">${index + 1}</td>
            <td>
                <div class="item-name-cell">
                    <span>${escapeHtml(item.name)}</span>
                    ${item.notes ? `<span class="item-meta"><i class="fa-solid fa-tag"></i> ${escapeHtml(item.notes)}</span>` : ""}
                    ${item.piecesPerPack ? `<span class="item-meta">العبوة: ${item.piecesPerPack} قطعة</span>` : ""}
                </div>
            </td>
            <td>
                <span class="badge-tag badge-company"><i class="fa-solid fa-building"></i> ${escapeHtml(item.company)}</span>
            </td>
            <td>${formatDate(item.date)}</td>
            <td><strong>${item.initialQty}</strong></td>
            <td style="color: var(--primary); font-weight: 600;">${item.soldQty || 0}</td>
            <td><strong style="font-size: 1rem; color: ${remaining <= 5 ? 'var(--danger)' : 'var(--text-primary)'};">${remaining}</strong></td>
            <td>${formatCurrency(item.buyPrice)}</td>
            <td><span style="text-decoration: ${Number(item.discount) > 0 ? 'line-through' : 'none'}; color: ${Number(item.discount) > 0 ? 'var(--text-muted)' : 'inherit'};">${formatCurrency(item.sellPrice)}</span></td>
            <td>
                ${Number(item.discount) > 0 ? `<span class="discount-pill">${formatCurrency(item.discount)} خصم</span>` : `<span style="color: var(--text-muted);">-</span>`}
            </td>
            <td><strong style="color: var(--primary); font-size: 0.95rem;">${formatCurrency(netSellPrice)}</strong></td>
            <td>${unitProfitHtml}</td>
            <td>
                <strong class="${totalExpectedProfit >= 0 ? 'text-success' : 'text-danger'}">
                    ${formatCurrency(totalExpectedProfit)}
                </strong>
            </td>
            <td>${stockBadgeHtml}</td>
            <td class="actions-col">
                <div class="table-actions">
                    <button class="btn-icon btn-icon-sell" onclick="openSellModal('${item.id}')" title="تسجيل عملية بيع فوري" ${remaining <= 0 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : ''}>
                        <i class="fa-solid fa-cart-shopping"></i>
                        <span>بيع</span>
                    </button>
                    <button class="btn-icon btn-icon-edit" onclick="openEditModal('${item.id}')" title="تعديل بيانات الصنف">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="btn-icon btn-icon-delete" onclick="deleteProduct('${item.id}')" title="حذف هذا الصنف من الدفتر">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </td>
        `;

        inventoryTableBody.appendChild(tr);
    });

    // Update Footer Summary
    footerItemsCount.textContent = filtered.length;
    footerTotalStockValue.textContent = formatCurrency(displayedStockValue);
    footerTotalExpectedProfit.textContent = formatCurrency(displayedExpectedProfit);
    footerTotalExpectedProfit.className = displayedExpectedProfit >= 0 ? 'text-success' : 'text-danger';
}

/**
 * Render Sales History Table
 */
function renderSalesTable() {
    salesTableBody.innerHTML = "";

    if (sales.length === 0) {
        salesEmptyState.style.display = "block";
    } else {
        salesEmptyState.style.display = "none";
    }

    let totalRevenue = 0;
    let totalProfit = 0;

    // Show recent sales first
    const sortedSales = [...sales].reverse();

    sortedSales.forEach((sale) => {
        totalRevenue += Number(sale.totalBill || 0);
        totalProfit += Number(sale.netProfit || 0);

        const profitMargin = sale.totalBill > 0 ? ((sale.netProfit / sale.totalBill) * 100).toFixed(1) : 0;
        const isProfitable = Number(sale.netProfit) >= 0;

        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong style="color: var(--primary);">${escapeHtml(sale.id)}</strong></td>
            <td>${escapeHtml(sale.date)}</td>
            <td><strong>${escapeHtml(sale.productName)}</strong></td>
            <td><span class="badge-tag badge-company">${escapeHtml(sale.company || "-")}</span></td>
            <td><strong style="font-size: 1rem;">${sale.qty}</strong></td>
            <td>${formatCurrency(sale.buyPrice)}</td>
            <td>${formatCurrency(sale.sellUnitPrice)}</td>
            <td>
                ${Number(sale.discount) > 0 ? `<span class="discount-pill">${formatCurrency(sale.discount)}</span>` : `<span style="color:var(--text-muted);">-</span>`}
            </td>
            <td><strong>${formatCurrency(sale.netSellPrice)}</strong></td>
            <td><strong style="font-size: 0.95rem; color: var(--primary);">${formatCurrency(sale.totalBill)}</strong></td>
            <td>
                <strong class="${isProfitable ? 'profit-text' : 'loss-text'}">
                    ${isProfitable ? '+' : ''}${formatCurrency(sale.netProfit)}
                </strong>
            </td>
            <td>
                <span class="badge-tag ${isProfitable ? 'badge-success' : 'badge-danger'}">
                    ${profitMargin}%
                </span>
            </td>
            <td><span style="font-size: 0.8rem; color: var(--text-secondary);">${escapeHtml(sale.customer || "عميل نقدي")}</span></td>
            <td class="text-center">
                <button class="btn-icon btn-icon-delete" onclick="refundSale('${sale.id}')" title="إلغاء عملية البيع وإرجاع الكمية للمخزن">
                    <i class="fa-solid fa-rotate-left"></i>
                </button>
            </td>
        `;

        salesTableBody.appendChild(tr);
    });

    document.getElementById("salesFooterCount").textContent = sales.length;
    document.getElementById("salesFooterRevenue").textContent = formatCurrency(totalRevenue);
    const profitEl = document.getElementById("salesFooterProfit");
    profitEl.textContent = formatCurrency(totalProfit);
    profitEl.className = totalProfit >= 0 ? "text-success" : "text-danger";
}

/**
 * Render Analytics: Supplier breakdown & Top profitable products
 */
function renderAnalytics() {
    // 1. Company Breakdown
    const companyStats = {};

    products.forEach(p => {
        const comp = p.company.trim() || "غير محدد";
        if (!companyStats[comp]) {
            companyStats[comp] = {
                itemsCount: 0,
                purchaseValue: 0,
                salesRevenue: 0,
                netProfit: 0
            };
        }
        companyStats[comp].itemsCount += 1;
        companyStats[comp].purchaseValue += Number(p.initialQty || 0) * Number(p.buyPrice || 0);
    });

    sales.forEach(s => {
        const comp = s.company ? s.company.trim() : "غير محدد";
        if (companyStats[comp]) {
            companyStats[comp].salesRevenue += Number(s.totalBill || 0);
            companyStats[comp].netProfit += Number(s.netProfit || 0);
        }
    });

    const companyAnalyticsBody = document.getElementById("companyAnalyticsBody");
    companyAnalyticsBody.innerHTML = "";

    const sortedCompanies = Object.entries(companyStats).sort((a, b) => b[1].netProfit - a[1].netProfit);

    sortedCompanies.forEach(([companyName, data]) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${escapeHtml(companyName)}</strong></td>
            <td>${data.itemsCount}</td>
            <td>${formatCurrency(data.purchaseValue)}</td>
            <td style="color: var(--primary); font-weight: 600;">${formatCurrency(data.salesRevenue)}</td>
            <td class="${data.netProfit >= 0 ? 'text-success' : 'text-danger'}" style="font-weight: 700;">
                ${data.netProfit >= 0 ? '+' : ''}${formatCurrency(data.netProfit)}
            </td>
        `;
        companyAnalyticsBody.appendChild(tr);
    });

    // 2. Top Profitable Items
    const topItemsList = document.getElementById("topProfitableList");
    topItemsList.innerHTML = "";

    // Calculate total realized profit per product from sales
    const productSalesMap = {};
    sales.forEach(s => {
        if (!productSalesMap[s.productId]) {
            productSalesMap[s.productId] = {
                name: s.productName,
                company: s.company,
                soldCount: 0,
                totalProfit: 0
            };
        }
        productSalesMap[s.productId].soldCount += Number(s.qty || 0);
        productSalesMap[s.productId].totalProfit += Number(s.netProfit || 0);
    });

    const sortedProducts = Object.values(productSalesMap).sort((a, b) => b.totalProfit - a.totalProfit);

    if (sortedProducts.length === 0) {
        topItemsList.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">لا توجد مبيعات محققة حتى الآن لحساب الأكثر ربحية</div>`;
    } else {
        sortedProducts.slice(0, 5).forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "top-item-card";
            card.innerHTML = `
                <div class="top-item-info">
                    <strong>#${index + 1} - ${escapeHtml(item.name)}</strong>
                    <span>الشركة: ${escapeHtml(item.company)} | بيع منها: ${item.soldCount} قطعة</span>
                </div>
                <div class="top-item-profit">
                    <strong>+${formatCurrency(item.totalProfit)}</strong>
                    <span>صافي الربح</span>
                </div>
            `;
            topItemsList.appendChild(card);
        });
    }
}

// =========================================================================
// Add / Edit Product Logic
// =========================================================================
function openAddModal() {
    productForm.reset();
    editProductId.value = "";
    productModalTitle.textContent = "إضافة بضاعة جديدة للدفتر";
    document.getElementById("btnSaveProduct").innerHTML = `<i class="fa-solid fa-check"></i> <span>حفظ الصنف في الدفتر</span>`;
    
    // Set default date to today
    inputDate.value = new Date().toISOString().split('T')[0];
    inputDiscount.value = "0";

    updateLiveCalculations();
    productModal.classList.add("active");
    inputName.focus();
}

function openEditModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editProductId.value = product.id;
    inputName.value = product.name;
    inputCompany.value = product.company;
    inputDate.value = product.date;
    inputQty.value = product.initialQty;
    inputPiecesPerPack.value = product.piecesPerPack || "";
    inputBuyPrice.value = product.buyPrice;
    inputSellPrice.value = product.sellPrice;
    inputDiscount.value = product.discount || 0;
    inputNotes.value = product.notes || "";

    productModalTitle.textContent = "تعديل بيانات الصنف الطبي";
    document.getElementById("btnSaveProduct").innerHTML = `<i class="fa-solid fa-rotate"></i> <span>تحديث البيانات</span>`;

    updateLiveCalculations();
    productModal.classList.add("active");
    inputName.focus();
}

function closeProductModal() {
    productModal.classList.remove("active");
    productForm.reset();
    editProductId.value = "";
}

function updateLiveCalculations() {
    const buyPrice = parseFloat(inputBuyPrice.value) || 0;
    const sellPrice = parseFloat(inputSellPrice.value) || 0;
    const discount = parseFloat(inputDiscount.value) || 0;
    const qty = parseInt(inputQty.value, 10) || 0;

    const netSell = Math.max(0, sellPrice - discount);
    const unitProfit = netSell - buyPrice;
    const totalCost = buyPrice * qty;
    const totalExpectedProfit = unitProfit * qty;

    calcNetSellPrice.textContent = formatCurrency(netSell);
    calcUnitProfit.textContent = formatCurrency(unitProfit);
    calcTotalCost.textContent = formatCurrency(totalCost);
    calcTotalProfit.textContent = formatCurrency(totalExpectedProfit);

    if (unitProfit >= 0) {
        calcUnitProfit.className = "calc-num text-success";
        calcTotalProfit.className = "calc-num text-success";
        calcWarningAlert.style.display = "none";
    } else {
        calcUnitProfit.className = "calc-num text-danger";
        calcTotalProfit.className = "calc-num text-danger";
        calcLossAmount.textContent = Math.abs(unitProfit).toFixed(2);
        calcWarningAlert.style.display = "flex";
    }
}

function handleProductFormSubmit(e) {
    e.preventDefault();

    const name = inputName.value.trim();
    const company = inputCompany.value.trim();
    const date = inputDate.value;
    const initialQty = parseInt(inputQty.value, 10);
    const piecesPerPack = inputPiecesPerPack.value ? parseInt(inputPiecesPerPack.value, 10) : null;
    const buyPrice = parseFloat(inputBuyPrice.value);
    const sellPrice = parseFloat(inputSellPrice.value);
    const discount = parseFloat(inputDiscount.value) || 0;
    const notes = inputNotes.value.trim();

    if (!name || !company || !date || isNaN(initialQty) || isNaN(buyPrice) || isNaN(sellPrice)) {
        showToast("يرجى ملء جميع الحقول المطلوبة بشكل صحيح", "danger");
        return;
    }

    const idToEdit = editProductId.value;

    if (idToEdit) {
        // Edit existing product
        const index = products.findIndex(p => p.id === idToEdit);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                name,
                company,
                date,
                initialQty,
                piecesPerPack,
                buyPrice,
                sellPrice,
                discount,
                notes
            };
            showToast("تم تحديث بيانات الصنف بنجاح", "success");
        }
    } else {
        // Create new product
        const newProduct = {
            id: "med-" + Date.now(),
            name,
            company,
            date,
            initialQty,
            piecesPerPack,
            buyPrice,
            sellPrice,
            discount,
            soldQty: 0,
            notes
        };
        products.unshift(newProduct);
        showToast("تمت إضافة الصنف الجديد إلى المخزن بنجاح", "success");
    }

    saveProducts();
    closeProductModal();
    renderAll();
}

function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (confirm(`هل أنت متأكد من رغبتك في حذف الصنف "${product.name}" نهائياً من الدفتر؟`)) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        renderAll();
        showToast("تم حذف الصنف من الدفتر", "info");
    }
}

// =========================================================================
// Quick Sell Logic
// =========================================================================
function openSellModal(id) {
    let product;
    if (id) {
        product = products.find(p => p.id === id);
    } else {
        // pick first available product
        product = products.find(p => (Number(p.initialQty) - Number(p.soldQty || 0)) > 0);
    }

    if (!product) {
        showToast("لا يوجد أصناف متوفرة للبيع حالياً في المخزن!", "danger");
        return;
    }

    const available = Math.max(0, Number(product.initialQty) - Number(product.soldQty || 0));
    if (available <= 0) {
        showToast("هذا الصنف نفد بالكامل من المخزن!", "danger");
        return;
    }

    sellProductId.value = product.id;
    sellModalProductName.textContent = product.name;
    sellModalCompany.textContent = product.company;
    sellModalAvailableQty.textContent = `${available} قطعة`;
    sellModalBuyPrice.textContent = formatCurrency(product.buyPrice);

    sellQty.value = "1";
    sellQty.max = available;
    sellMaxQtyHint.textContent = `الحد الأقصى المتوفر: ${available} قطعة`;

    // Standard sell price & current discount
    sellUnitPrice.value = product.sellPrice;
    sellDiscount.value = product.discount || 0;
    sellCustomer.value = "";

    updateSellCalculations();
    sellModal.classList.add("active");
    sellQty.focus();
}

function closeSellModal() {
    sellModal.classList.remove("active");
    sellForm.reset();
}

function updateSellCalculations() {
    const product = products.find(p => p.id === sellProductId.value);
    if (!product) return;

    const qty = parseInt(sellQty.value, 10) || 0;
    const unitPrice = parseFloat(sellUnitPrice.value) || 0;
    const discount = parseFloat(sellDiscount.value) || 0;
    const buyPrice = Number(product.buyPrice) || 0;

    const netSellPrice = Math.max(0, unitPrice - discount);
    const totalBill = netSellPrice * qty;
    const totalCost = buyPrice * qty;
    const netProfit = totalBill - totalCost;

    sellTotalBill.textContent = formatCurrency(totalBill);
    sellTotalCost.textContent = formatCurrency(totalCost);
    sellNetProfit.textContent = formatCurrency(netProfit);

    if (netProfit >= 0) {
        sellProfitLabel.textContent = "صافي الربح المحقق من هذه البيعة:";
        sellNetProfit.className = "text-success";
    } else {
        sellProfitLabel.textContent = "صافي الخسارة من هذه البيعة:";
        sellNetProfit.className = "text-danger";
    }
}

function handleSellFormSubmit(e) {
    e.preventDefault();

    const product = products.find(p => p.id === sellProductId.value);
    if (!product) return;

    const qty = parseInt(sellQty.value, 10);
    const available = Math.max(0, Number(product.initialQty) - Number(product.soldQty || 0));

    if (isNaN(qty) || qty <= 0) {
        showToast("يرجى إدخال كمية صحيحة للبيع", "danger");
        return;
    }

    if (qty > available) {
        showToast(`الكمية المطلوبة (${qty}) تتجاوز المتوفر في المخزن (${available})!`, "danger");
        return;
    }

    const unitPrice = parseFloat(sellUnitPrice.value) || 0;
    const discount = parseFloat(sellDiscount.value) || 0;
    const customer = sellCustomer.value.trim() || "عميل نقدي";
    const netSellPrice = Math.max(0, unitPrice - discount);
    const totalBill = netSellPrice * qty;
    const totalCost = Number(product.buyPrice) * qty;
    const netProfit = totalBill - totalCost;

    const now = new Date();
    const dateFormatted = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Create Sale Transaction
    const newSale = {
        id: "INV-" + (1000 + sales.length + 1),
        productId: product.id,
        productName: product.name,
        company: product.company,
        date: dateFormatted,
        qty: qty,
        buyPrice: product.buyPrice,
        sellUnitPrice: unitPrice,
        discount: discount,
        netSellPrice: netSellPrice,
        totalBill: totalBill,
        totalCost: totalCost,
        netProfit: netProfit,
        customer: customer
    };

    // Update product soldQty
    product.soldQty = (Number(product.soldQty) || 0) + qty;

    sales.push(newSale);

    saveProducts();
    saveSales();
    closeSellModal();
    renderAll();

    const profitMsg = netProfit >= 0 ? `بربح محقق ${formatCurrency(netProfit)}` : `بخسارة ${formatCurrency(Math.abs(netProfit))}`;
    showToast(`تم إتمام البيع بنجاح: تم بيع ${qty} قطعة بمبلغ ${formatCurrency(totalBill)} (${profitMsg})`, "success");
}

/**
 * Refund / Cancel a sale transaction and restore inventory stock
 */
function refundSale(saleId) {
    const sale = sales.find(s => s.id === saleId);
    if (!sale) return;

    if (confirm(`هل تريد بالتأكيد إلغاء عملية البيع رقم (${sale.id}) وإرجاع كمية (${sale.qty}) إلى المخزن؟`)) {
        // Return qty to product
        const product = products.find(p => p.id === sale.productId);
        if (product) {
            product.soldQty = Math.max(0, (Number(product.soldQty) || 0) - Number(sale.qty));
        }

        sales = sales.filter(s => s.id !== saleId);
        saveProducts();
        saveSales();
        renderAll();
        showToast("تم إلغاء عملية البيع وإرجاع الكمية إلى المخزن بنجاح", "info");
    }
}

// =========================================================================
// Export, Print & Reset Utilities
// =========================================================================
function exportDataToCSV() {
    if (products.length === 0) {
        showToast("لا توجد بيانات بالمخزن لتصديرها!", "danger");
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // UTF-8 BOM for Arabic support in Excel
    
    // Header
    csvContent += "كود الصنف,اسم الصنف,الشركة الموردة,تاريخ الشراء,الكمية الأصلية,المباع,المتبقي,سعر الشراء,سعر البيع,الخصم,سعر البيع الفعلي,ربح القطعة,إجمالي الربح المتوقع,ملاحظات\n";

    products.forEach(p => {
        const remaining = Math.max(0, Number(p.initialQty) - Number(p.soldQty || 0));
        const netSell = Math.max(0, Number(p.sellPrice) - Number(p.discount || 0));
        const unitProfit = netSell - Number(p.buyPrice);
        const totalProfit = unitProfit * remaining;

        const row = [
            `"${p.id}"`,
            `"${p.name.replace(/"/g, '""')}"`,
            `"${p.company.replace(/"/g, '""')}"`,
            `"${p.date}"`,
            p.initialQty,
            p.soldQty || 0,
            remaining,
            p.buyPrice,
            p.sellPrice,
            p.discount || 0,
            netSell,
            unitProfit,
            totalProfit,
            `"${(p.notes || '').replace(/"/g, '""')}"`
        ].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `تقرير_مستلزمات_ميديكال_كير_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("تم تنزيل ملف الإكسيل (CSV) بنجاح!", "success");
}

function promptResetData() {
    const choice = confirm("هل تريد إعادة تعيين البيانات؟\nاضغط 'موافق' لتحميل البيانات التجريبية للمستلزمات الطبية، أو 'إلغاء' للإبقاء على بياناتك الحالية.");
    if (choice) {
        products = [...INITIAL_PRODUCTS];
        sales = [...INITIAL_SALES];
        saveProducts();
        saveSales();
        renderAll();
        showToast("تمت استعادة البيانات التجريبية بنجاح", "info");
    }
}

// =========================================================================
// Theme (Light / Dark Mode)
// =========================================================================
function loadTheme() {
    const savedTheme = localStorage.getItem("medical_theme") || "light";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("medical_theme", newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    if (theme === "dark") {
        themeIcon.className = "fa-solid fa-sun";
        themeToggle.title = "التبديل إلى الوضع الفاتح";
    } else {
        themeIcon.className = "fa-solid fa-moon";
        themeToggle.title = "التبديل إلى الوضع الليلي";
    }
}

// =========================================================================
// Toast Notification
// =========================================================================
function showToast(message, type = "info") {
    const toastContainer = document.getElementById("toastContainer");
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    let iconHtml = '<i class="fa-solid fa-circle-info"></i>';
    if (type === "success") iconHtml = '<i class="fa-solid fa-circle-check"></i>';
    if (type === "danger") iconHtml = '<i class="fa-solid fa-circle-exclamation"></i>';

    toast.innerHTML = `${iconHtml}<span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(-20px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// =========================================================================
// Helper Utilities
// =========================================================================
function formatCurrency(num) {
    const val = Number(num) || 0;
    return val.toLocaleString("ar-EG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " ج.م";
}

function formatDate(dateStr) {
    if (!dateStr) return "-";
    return dateStr;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =========================================================================
// Event Listeners Setup
// =========================================================================
function setupEventListeners() {
    // Header Buttons
    document.getElementById("btnOpenAddModal").addEventListener("click", openAddModal);
    document.getElementById("btnExportData").addEventListener("click", exportDataToCSV);
    document.getElementById("btnPrintReport").addEventListener("click", () => window.print());
    themeToggle.addEventListener("click", toggleTheme);

    // Tab Switching
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelectorAll(".tab-pane").forEach(p => p.classList.remove("active"));

            btn.classList.add("active");
            const targetId = btn.getAttribute("data-tab");
            document.getElementById(targetId).classList.add("active");
        });
    });

    // Toolbar Filters & Search
    searchInput.addEventListener("input", () => {
        clearSearchBtn.style.display = searchInput.value.trim() ? "block" : "none";
        renderInventoryTable();
    });

    clearSearchBtn.addEventListener("click", () => {
        searchInput.value = "";
        clearSearchBtn.style.display = "none";
        renderInventoryTable();
        searchInput.focus();
    });

    filterCompany.addEventListener("change", renderInventoryTable);
    filterStatus.addEventListener("change", renderInventoryTable);
    sortBy.addEventListener("change", renderInventoryTable);
    document.getElementById("btnResetDataPrompt").addEventListener("click", promptResetData);

    // Add / Edit Product Modal Events
    document.getElementById("btnCloseProductModal").addEventListener("click", closeProductModal);
    document.getElementById("btnCancelProductModal").addEventListener("click", closeProductModal);
    productForm.addEventListener("submit", handleProductFormSubmit);

    // Live Calculation listeners in Add/Edit modal
    [inputBuyPrice, inputSellPrice, inputDiscount, inputQty].forEach(input => {
        input.addEventListener("input", updateLiveCalculations);
    });

    // Quick presets click in Add Modal
    document.querySelectorAll(".tag-btn").forEach(tag => {
        tag.addEventListener("click", () => {
            inputName.value = tag.getAttribute("data-name") || "";
            inputCompany.value = tag.getAttribute("data-company") || "";
            inputBuyPrice.value = tag.getAttribute("data-buy") || "";
            inputSellPrice.value = tag.getAttribute("data-sell") || "";
            inputDiscount.value = tag.getAttribute("data-discount") || "0";
            if (!inputQty.value) inputQty.value = "20";
            updateLiveCalculations();
            inputQty.focus();
        });
    });

    // Sell Modal Events
    document.getElementById("btnCloseSellModal").addEventListener("click", closeSellModal);
    document.getElementById("btnCancelSellModal").addEventListener("click", closeSellModal);
    sellForm.addEventListener("submit", handleSellFormSubmit);
    document.getElementById("btnQuickSellNew").addEventListener("click", () => openSellModal());

    [sellQty, sellUnitPrice, sellDiscount].forEach(input => {
        input.addEventListener("input", updateSellCalculations);
    });

    // Clear Sales Log button
    document.getElementById("btnClearSalesLog").addEventListener("click", () => {
        if (sales.length === 0) return;
        if (confirm("هل تريد تفريغ وحذف جميع سجلات المبيعات السابقة؟")) {
            sales = [];
            saveSales();
            renderAll();
            showToast("تم مسح سجل المبيعات", "info");
        }
    });

    // Close modals on clicking outside backdrop
    window.addEventListener("click", (e) => {
        if (e.target === productModal) closeProductModal();
        if (e.target === sellModal) closeSellModal();
    });

    // Escape key to close modals
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeProductModal();
            closeSellModal();
        }
    });
}

// Global exposure for inline onclick handlers
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.openSellModal = openSellModal;
window.deleteProduct = deleteProduct;
window.refundSale = refundSale;

// Boot application when DOM is ready
document.addEventListener("DOMContentLoaded", initApp);
