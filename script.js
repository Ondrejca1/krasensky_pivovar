$(document).ready(function() {
    const orderList = $('#order-list');
    const totalPriceElement = $('#total-price');
    const orderSummary = {
        'Portáš 11': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'Krásenská 12': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'Krásenská 13': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'Virgil 12': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'PALE ALE 14': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } }
    };
    const cupsSummary = { quantity: 0, total: 0 };
    const otherItemsSummary = { 'Pet láhev 1L': { quantity: 0, total: 0 }, 'Prodej kelímku': { quantity: 0, total: 0 } };
    const orderHistory = [];
    const cupsHistory = [];
    const otherItemsHistory = [];
    const reportData = { totalAmount: 0, days: {} };

    $('.form-tile form').submit(function(event) {
        event.preventDefault();

        const name = $(this).find('input[name="name"]').val();
        const price = parseInt($(this).find('input[name="price"]').val());
        const size = $(this).find('select[name="size"]').val() || '';
        const quantity = parseInt($(this).find('select[name="quantity"]').val());
        const totalPriceForItem = price * quantity;
        const cupPrice = 50 * quantity;

        if (name !== 'Vratka kelímku' && name !== 'Pet láhev 1L' && name !== 'Prodej kelímku') {
            const listItem = $('<li>').addClass('order-item');
            const itemText = `${name} - ${price} Kč${size ? '/' + size + 'l' : ''}`;
            listItem.text(`${itemText} (Počet: ${quantity}, Celkem: ${totalPriceForItem + cupPrice} Kč)`);

            const removeButton = $('<button>').text('Odebrat').addClass('remove-button');
            removeButton.click(function() {
                listItem.remove();
                if (size) {
                    orderSummary[name][size].quantity -= quantity;
                    orderSummary[name][size].total -= totalPriceForItem;
                    cupsSummary.quantity -= quantity;
                    cupsSummary.total -= cupPrice;
                } else {
                    cupsSummary.quantity -= quantity;
                    cupsSummary.total -= totalPriceForItem;
                }
                updateTotalPrice();
            });

            listItem.append(removeButton);
            orderList.append(listItem);

            if (size) {
                orderSummary[name][size].quantity += quantity;
                orderSummary[name][size].total += totalPriceForItem;
                cupsSummary.quantity += quantity;
                cupsSummary.total += cupPrice;
            } else {
                cupsSummary.quantity += quantity;
                cupsSummary.total += totalPriceForItem;
            }
        } else if (name === 'Pet láhev 1L' || name === 'Prodej kelímku') {
            const listItem = $('<li>').addClass('order-item');
            const itemText = `${name} - ${price} Kč`;
            listItem.text(`${itemText} (Počet: ${quantity}, Celkem: ${totalPriceForItem} Kč)`);

            const removeButton = $('<button>').text('Odebrat').addClass('remove-button');
            removeButton.click(function() {
                listItem.remove();
                otherItemsSummary[name].quantity -= quantity;
                otherItemsSummary[name].total -= totalPriceForItem;
                updateTotalPrice();
            });

            listItem.append(removeButton);
            orderList.append(listItem);

            otherItemsSummary[name].quantity += quantity;
            otherItemsSummary[name].total += totalPriceForItem;
        } else {
            const listItem = $('<li>').addClass('order-item');
            const itemText = `${name} - ${price} Kč`;
            listItem.text(`${itemText} (Počet: ${quantity}, Celkem: ${totalPriceForItem} Kč)`);

            const removeButton = $('<button>').text('Odebrat').addClass('remove-button');
            removeButton.click(function() {
                listItem.remove();
                cupsSummary.quantity -= quantity;
                cupsSummary.total -= totalPriceForItem;
                updateTotalPrice();
            });

            listItem.append(removeButton);
            orderList.append(listItem);

            cupsSummary.quantity -= quantity;
            cupsSummary.total -= totalPriceForItem;
        }

        updateTotalPrice();

        // Reset form fields
        $(this).find('select[name="size"]').val('0.3');
        $(this).find('select[name="quantity"]').val('1');
    });

    function updateTotalPrice() {
        let totalPrice = 0;
        for (let beer in orderSummary) {
            for (let size in orderSummary[beer]) {
                totalPrice += orderSummary[beer][size].total;
            }
        }
        totalPrice += cupsSummary.total;
        for (let item in otherItemsSummary) {
            totalPrice += otherItemsSummary[item].total;
        }
        totalPriceElement.text(totalPrice);
    }

    function showReport() {
        let reportHtml = '<table><tr><th>Den</th><th>Položka</th><th>Velikost</th><th>Počet</th><th>Celkem (Kč)</th></tr>';
        for (let day in reportData.days) {
            for (let beer in reportData.days[day].beers) {
                for (let size in reportData.days[day].beers[beer]) {
                    reportHtml += `<tr><td>${day}</td><td>${beer}</td><td>${size}l</td><td>${reportData.days[day].beers[beer][size].quantity}</td><td>${reportData.days[day].beers[beer][size].total}</td></tr>`;
                }
            }
            reportHtml += `<tr><td>${day}</td><td>Kelímky</td><td></td><td>${reportData.days[day].cups.quantity}</td><td>${reportData.days[day].cups.total}</td></tr>`;
            reportHtml += `<tr><td>${day}</td><td>Pet láhev 1L</td><td></td><td>${reportData.days[day].otherItems['Pet láhev 1L'].quantity}</td><td>${reportData.days[day].otherItems['Pet láhev 1L'].total}</td></tr>`;
            reportHtml += `<tr><td>${day}</td><td>Prodej kelímku</td><td></td><td>${reportData.days[day].otherItems['Prodej kelímku'].quantity}</td><td>${reportData.days[day].otherItems['Prodej kelímku'].total}</td></tr>`;
        }
        reportHtml += `<tr><td colspan="4">Celkem</td><td>${reportData.totalAmount} Kč</td></tr></table>`;
        const reportWindow = window.open('', '', 'width=800,height=600');
        reportWindow.document.write('<html><head><title>Report</title></head><body>');
        reportWindow.document.write('<h1>Report</h1>');
        reportWindow.document.write(reportHtml);
        reportWindow.document.write('</body></html>');
        reportWindow.document.close();
    }

    function completeOrder() {
        let totalOrderPrice = parseInt(totalPriceElement.text());
        const today = new Date().toLocaleDateString('cs-CZ');
        orderHistory.push(JSON.parse(JSON.stringify(orderSummary)));
        cupsHistory.push(JSON.parse(JSON.stringify(cupsSummary)));
        otherItemsHistory.push(JSON.parse(JSON.stringify(otherItemsSummary)));
        reportData.totalAmount += totalOrderPrice;

        if (!reportData.days[today]) {
            reportData.days[today] = { beers: JSON.parse(JSON.stringify(orderSummary)), cups: JSON.parse(JSON.stringify(cupsSummary)), otherItems: JSON.parse(JSON.stringify(otherItemsSummary)) };
        } else {
            for (let beer in orderSummary) {
                for (let size in orderSummary[beer]) {
                    reportData.days[today].beers[beer][size].quantity += orderSummary[beer][size].quantity;
                    reportData.days[today].beers[beer][size].total += orderSummary[beer][size].total;
                }
            }
            reportData.days[today].cups.quantity += cupsSummary.quantity;
            reportData.days[today].cups.total += cupsSummary.total;
            for (let item in otherItemsSummary) {
                reportData.days[today].otherItems[item].quantity += otherItemsSummary[item].quantity;
                reportData.days[today].otherItems[item].total += otherItemsSummary[item].total;
            }
        }

        $('#total-modal-text').text(`Celková cena: ${totalOrderPrice} Kč`);
        $('#total-modal').css('display', 'block');
        $('#total-modal-text').css('color', '#2c3e50'); // Ensure text color is visible
        resetOrder();
    }

    function resetOrder() {
        orderList.empty();
        for (let beer in orderSummary) {
            for (let size in orderSummary[beer]) {
                orderSummary[beer][size].quantity = 0;
                orderSummary[beer][size].total = 0;
            }
        }
        cupsSummary.quantity = 0;
        cupsSummary.total = 0;
        for (let item in otherItemsSummary) {
            otherItemsSummary[item].quantity = 0;
            otherItemsSummary[item].total = 0;
        }
        updateTotalPrice();
        $('#received-amount').val('');
        $('#tip-amount').val('');
        $('#change-text').text('');
    }

    $('#complete-order').click(completeOrder);

    function calculateChange() {
        const receivedAmount = parseFloat($('#received-amount').val()) || 0;
        const tipAmount = parseFloat($('#tip-amount').val()) || 0;
        const totalOrderPrice = parseInt($('#total-modal-text').text().replace('Celková cena: ', '').replace(' Kč', ''));
        const change = (tipAmount > 0 ? receivedAmount - tipAmount : receivedAmount - totalOrderPrice);
        $('#change-text').text(`Vrátit: ${change} Kč`);
    }

    $('#received-amount, #tip-amount').on('input', calculateChange);

    $('#close-modal').click(function() {
        $('#total-modal').css('display', 'none');
    });

    const reportButton = $('<button>').text('Zobrazit report').addClass('submit-button');
    reportButton.click(showReport);
    $('body').append(reportButton);
});
