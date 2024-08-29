import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Eye, Edit, Clipboard } from 'lucide-react';

import TableComponent from '../../../components/admin/ViewTableComponent/ViewTableComponents';
import Header from '../../../components/common/admins/Header';

const ViewReceipt = () => {
    const [receipts, setReceipts] = useState([]);
    const [filteredReceipts, setFilteredReceipts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReceiptData();
    }, []);

    const fetchReceiptData = async () => {
        try {
            const response = await axios.get('https://abbas-test-project-4dc6504935e5.herokuapp.com/api/admin/viewReceipts');

            // Format the dates to yyyy-mm-dd
            const formatDate = (dateStr) => {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) {
                    console.error('Invalid date:', dateStr);
                    return ''; // Fallback to an empty string if parsing fails
                }
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            };

            const formattedData = response.data.map(receipt => ({
                ...receipt,
                paymentDate: formatDate(receipt.paymentDate),
                amount: parseFloat(receipt.amount).toFixed(2), // Format amount to 2 decimal places
            }));

            setReceipts(formattedData);
            setFilteredReceipts(formattedData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching receipt data:', error);
            setLoading(false);
        }
    };

    const columns = [
        { header: 'Receipt ID', accessor: 'receiptID' },
        { header: 'Invoice ID', accessor: 'invoiceID' },
        { header: 'Payment Date', accessor: 'paymentDate' },
        { header: 'Payment Mode', accessor: 'payment_mode' },
        { header: 'Amount (AED)', accessor: 'amount' },
        { header: 'Status', accessor: 'status' },
        { header: 'Description', accessor: 'description' },
    ];

    const handleFilter = (filterText) => {
        const lowercasedFilter = filterText.toLowerCase();
        const filteredData = receipts.filter((item) =>
            columns.some((col) =>
                item[col.accessor].toString().toLowerCase().includes(lowercasedFilter)
            )
        );
        setFilteredReceipts(filteredData);
    };

    const handleSort = (column, direction) => {
        const sortedData = [...filteredReceipts].sort((a, b) => {
            const aValue = a[column] || '';
            const bValue = b[column] || '';
            return direction === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        });
        setFilteredReceipts(sortedData);
    };

    const renderActions = (receipt) => (
        <div className="flex space-x-4">
            <Link to={`/superadmin/read-receipt/${receipt.receiptID}`} className="text-blue-600 hover:text-blue-900">
                <Eye className="w-5 h-5" />
            </Link>
            <Link to={`/superadmin/update-receipt/${receipt.receiptID}`} className="text-blue-600 hover:text-blue-900">
                <Edit className="w-5 h-5" />
            </Link>
            <Link to={`/superadmin/pdf-receipt/${receipt.receiptID}`} className="text-gray-100 hover:text-gray-600">
                <Clipboard className="w-5 h-5" />
            </Link>
        </div>
    );

    return (
        <div className="flex-1 overflow-auto relative z-10">
            <Header title="View Receipt" />
            <main className="max-w-7xl mx-auto py-6 px-4 lg:px-8">
                <motion.div
                    className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-100">Receipt List</h2>
                    </div>

                    <div className="mb-4">
                        <Link to={`/superadmin/add-receipt`} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                            + Add Receipt
                        </Link>
                    </div>
                    <TableComponent
                        columns={columns}
                        data={filteredReceipts}
                        loading={loading}
                        renderActions={renderActions}
                        onFilter={handleFilter}
                        onSort={handleSort}
                    />
                </motion.div>
            </main>
        </div>
    );
};

export default ViewReceipt;
