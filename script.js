$(document).ready(function() {
    const orderList = $('#order-list');
    const totalPriceElement = $('#total-price');
    let totalOrderPrice = 0;

    const orderSummary = {
        'Portáš 11': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'Krásenská 12': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'Krásenská 13': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'Virgil 12': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'PALE ALE 14': { '0.3': { quantity: 0, total: 0 }, '0.5': { quantity: 0, total: 0 } },
        'Pet láhev 1L': { quantity: 0, total: 0 },
        'Prodej kelímku': { quantity: 0, total: 0 },
        'Vratka kelímku': { quantity: 0, total: 0 }
    };

    $('.form-tile form').submit(function(event) {
        event.preventDefault();

        const name = $(this).find('input[name="name"]').val();
        const price = parseInt($(this).find('input[name="price"]').val());
        const size = $(this).find('select[name="size"]').val() || '';
        const quantity = parseInt($(this).find('select[name="quantity"]').val());
        const totalPriceForItem = price * quantity;

        addOrderItem(name, price, size, quantity, totalPriceForItem);
        updateTotalPrice();
    });

    function addOrderItem(name, price, size, quantity, totalPriceForItem) {
        const listItem = $('<li>').addClass('order-item');
        const itemText = `${name} - ${price} Kč${size ? '/' + size + 'l' : ''}`;
        listItem.text(`${itemText} (Počet: ${quantity}, Celkem: ${totalPriceForItem} Kč)`);

        const removeButton = $('<button>').text('Odebrat').addClass('remove-button');
        removeButton.click(function() {
            listItem.remove();
            removeOrderItem(name, size, quantity, totalPriceForItem);
            updateTotalPrice();
        });

        listItem.append(removeButton);
        orderList.append(listItem);

        if (size) {
            orderSummary[name][size].quantity += quantity;
            orderSummary[name][size].total += totalPriceForItem;
        } else {
            orderSummary[name].quantity += quantity;
            orderSummary[name].total += totalPriceForItem;
        }
    }

    function removeOrderItem(name, size, quantity, totalPriceForItem) {
        if (size) {
            orderSummary[name][size].quantity -= quantity;
            orderSummary[name][size].total -= totalPriceForItem;
        } else {
            orderSummary[name].quantity -= quantity;
            orderSummary[name].total -= totalPriceForItem;
        }
    }

    function updateTotalPrice() {
        totalOrderPrice = 0;
        for (let item in orderSummary) {
            if (item === 'Pet láhev 1L' || item === 'Prodej kelímku' || item === 'Vratka kelímku') {
                totalOrderPrice += orderSummary[item].total;
            } else {
                for (let size in orderSummary[item]) {
                    totalOrderPrice += orderSummary[item][size].total;
                }
            }
        }
        totalPriceElement.text(totalOrderPrice);
    }

    $('#complete-order').click(function() {
        $('#total-modal-text').text(`Celková cena: ${totalOrderPrice} Kč`);
        $('#total-modal').css('display', 'block');
    });

    $('#close-modal').click(function() {
        const receivedAmount = parseFloat($('#received-amount').val()) || 0;
        const tipAmount = parseFloat($('#tip-amount').val()) || 0;
        const returnedCups = parseFloat($('#returned-cups').val()) || 0;
        const change = (tipAmount > 0 ? receivedAmount - tipAmount : receivedAmount - totalOrderPrice) + (returnedCups * 50);
        $('#change-text').text(`Vrátit: ${change} Kč`);
        $('#total-modal').css('display', 'none');
        resetOrder();
    });

    function resetOrder() {
        orderList.empty();
        for (let item in orderSummary) {
            if (item === 'Pet láhev 1L' || item === 'Prodej kelímku' || item === 'Vratka kelímku') {
                orderSummary[item].quantity = 0;
                orderSummary[item].total = 0;
            } else {
                for (let size in orderSummary[item]) {
                    orderSummary[item][size].quantity = 0;
                    orderSummary[item][size].total = 0;
                }
            }
        }
        totalOrderPrice = 0;
        totalPriceElement.text(totalOrderPrice);
        $('#received-amount').val('');
        $('#tip-amount').val('');
        $('#returned-cups').val('');
        $('#change-text').text('');
    }

    $('#received-amount, #tip-amount, #returned-cups').on('input', function() {
        const receivedAmount = parseFloat($('#received-amount').val()) || 0;
        const tipAmount = parseFloat($('#tip-amount').val()) || 0;
        const returnedCups = parseFloat($('#returned-cups').val()) || 0;
        const change = (tipAmount > 0 ? receivedAmount - tipAmount : receivedAmount - totalOrderPrice) + (returnedCups * 50);
        $('#change-text').text(`Vrátit: ${change} Kč`);
    });
});
