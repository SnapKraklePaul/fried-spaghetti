document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin orders script loaded');

    const viewButtons = document.querySelectorAll('.view-order');
    let currentlyOpenRow = null;

    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const orderId = this.getAttribute('data-order-id');
            toggleOrderDetails(orderId);
        });
    });

    function toggleOrderDetails(orderId) {
        const expandableRow = document.getElementById(`expandable-${orderId}`);
        const detailsDiv = expandableRow.querySelector('.order-details');

        if (currentlyOpenRow && currentlyOpenRow !== expandableRow) {
            closeCurrentRow();
        }

        if (detailsDiv.style.display === 'none') {
            fetchOrderDetails(orderId, detailsDiv);
            detailsDiv.style.display = 'block';
            currentlyOpenRow = expandableRow;
        } else {
            detailsDiv.style.display = 'none';
            currentlyOpenRow = null;
        }
    }

    function closeCurrentRow() {
        if (currentlyOpenRow) {
            const detailsDiv = currentlyOpenRow.querySelector('.order-details');
            detailsDiv.style.display = 'none';
        }
    }

    function fetchOrderDetails(orderId, detailsDiv) {
        fetch(`/admin/orders/${orderId}/details`)
            .then(response => response.text())
            .then(html => {
                const temp = document.createElement('div');
                temp.innerHTML = html;
                const content = temp.querySelector('.order-details-content');
                if (content) {
                    detailsDiv.innerHTML = content.innerHTML;
                } else {
                    detailsDiv.innerHTML = 'Error loading order details.';
                }
            })
            .catch(error => {
                console.error('Error fetching order details:', error);
                detailsDiv.innerHTML = 'Error loading order details.';
            });
    }
});