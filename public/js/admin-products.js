document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin products script loaded');

    const viewButtons = document.querySelectorAll('.view-product');
    const editButtons = document.querySelectorAll('.edit-product');
    let currentlyOpenRow = null;

    viewButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            toggleProductDetails(productId);
        });
    });

    editButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const productId = this.getAttribute('data-product-id');
            toggleProductEditForm(productId);
        });
    });

    function toggleProductDetails(productId) {
        const expandableRow = document.getElementById(`expandable-${productId}`);
        const detailsDiv = expandableRow.querySelector('.product-details');
        const editDiv = expandableRow.querySelector('.product-edit');

        if (currentlyOpenRow && currentlyOpenRow !== expandableRow) {
            closeCurrentRow();
        }

        if (detailsDiv.style.display === 'none') {
            fetchProductDetails(productId, detailsDiv);
            detailsDiv.style.display = 'block';
            editDiv.style.display = 'none';
            currentlyOpenRow = expandableRow;
        } else {
            detailsDiv.style.display = 'none';
            currentlyOpenRow = null;
        }
    }

    function toggleProductEditForm(productId) {
        const expandableRow = document.getElementById(`expandable-${productId}`);
        const detailsDiv = expandableRow.querySelector('.product-details');
        const editDiv = expandableRow.querySelector('.product-edit');

        if (currentlyOpenRow && currentlyOpenRow !== expandableRow) {
            closeCurrentRow();
        }

        if (editDiv.style.display === 'none') {
            fetchProductEditForm(productId, editDiv);
            editDiv.style.display = 'block';
            detailsDiv.style.display = 'none';
            currentlyOpenRow = expandableRow;
        } else {
            editDiv.style.display = 'none';
            currentlyOpenRow = null;
        }
    }

    function closeCurrentRow() {
        if (currentlyOpenRow) {
            const detailsDiv = currentlyOpenRow.querySelector('.product-details');
            const editDiv = currentlyOpenRow.querySelector('.product-edit');
            detailsDiv.style.display = 'none';
            editDiv.style.display = 'none';
        }
    }

    function fetchProductDetails(productId, detailsDiv) {
        console.log('Fetching product details for productId:', productId);
        fetch(`/admin/products/${productId}/details`)
            .then(response => {
                console.log('Response status:', response.status);
                return response.text();
            })
            .then(html => {
                console.log('Received HTML:', html);
                const temp = document.createElement('div');
                temp.innerHTML = html;
                const content = temp.querySelector('.product-details-content');
                if (content) {
                    detailsDiv.innerHTML = content.innerHTML;
                    console.log('Product details content set successfully');
                } else {
                    console.error('Could not find .product-details-content in the response');
                    detailsDiv.innerHTML = 'Error loading product details.';
                }
            })
            .catch(error => {
                console.error('Error fetching product details:', error);
                detailsDiv.innerHTML = 'Error loading product details.';
            });
    }

    function fetchProductEditForm(productId, editDiv) {
        console.log('Fetching product edit form for productId:', productId);
        fetch(`/admin/products/${productId}/edit`)
            .then(response => {
                console.log('Response status:', response.status);
                return response.text();
            })
            .then(html => {
                console.log('Received HTML:', html);
                const temp = document.createElement('div');
                temp.innerHTML = html;
                const content = temp.querySelector('.product-edit-content');
                if (content) {
                    editDiv.innerHTML = content.innerHTML;
                    setupEditForm(editDiv);
                    console.log('Product edit form set successfully');
                } else {
                    console.error('Could not find .product-edit-content in the response');
                    editDiv.innerHTML = 'Error loading edit form.';
                }
            })
            .catch(error => {
                console.error('Error fetching product edit form:', error);
                editDiv.innerHTML = 'Error loading edit form.';
            });
    }

    function setupEditForm(editDiv) {
        const form = editDiv.querySelector('form');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const formData = new FormData(form);
                const productId = form.getAttribute('data-product-id');

                fetch(`/admin/products/${productId}`, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        alert('Product updated successfully');
                        location.reload();
                    } else {
                        alert('Error updating product');
                    }
                })
                .catch(error => console.error('Error:', error));
            });
        }
    }

    // Debug click events
    document.addEventListener('click', function(e) {
        console.log('Clicked element:', e.target);
    });
});