import React, { useState, useEffect } from 'react';
import {
    FaArrowLeft,
    FaDownload,
    FaCheckCircle,
    FaClock,
    FaInfoCircle,
    FaExclamationTriangle,
    FaCalendarAlt,
    FaCode,
    FaBug,
    FaPlus,
    FaTrash
} from 'react-icons/fa';
import { FaShield } from 'react-icons/fa6';

const UpdateHistoryPage = () => {
    const [updateHistory, setUpdateHistory] = useState([]);
    const [currentVersion, setCurrentVersion] = useState('1.0.0');
    const [loading, setLoading] = useState(true);

    // Mock data - Replace with actual API call
    useEffect(() => {
        const mockHistory = [
            {
                id: 1,
                version: '1.2.1',
                releaseDate: '2025-09-20',
                status: 'current',
                size: '45.2 MB',
                type: 'patch',
                priority: 'medium',
                changelog: [
                    { type: 'fixed', text: 'Fixed dashboard loading issue on startup' },
                    { type: 'fixed', text: 'Resolved chart rendering bug in Safari' },
                    { type: 'changed', text: 'Improved notification banner design' }
                ],
                downloadUrl: 'https://example.com/v1.2.1',
                releaseNotes: 'This patch release focuses on bug fixes and minor UI improvements.'
            },
            {
                id: 2,
                version: '1.2.0',
                releaseDate: '2025-09-15',
                status: 'installed',
                size: '46.8 MB',
                type: 'minor',
                priority: 'high',
                changelog: [
                    { type: 'added', text: 'New status card grid component' },
                    { type: 'added', text: 'Enhanced update notification system' },
                    { type: 'changed', text: 'Updated chart library to latest version' },
                    { type: 'fixed', text: 'Memory leak in dashboard components' }
                ],
                downloadUrl: 'https://example.com/v1.2.0',
                releaseNotes: 'Major feature update with new components and performance improvements.'
            },
            {
                id: 3,
                version: '1.1.5',
                releaseDate: '2025-09-10',
                status: 'installed',
                size: '44.1 MB',
                type: 'patch',
                priority: 'low',
                changelog: [
                    { type: 'security', text: 'Security patches for data handling' },
                    { type: 'fixed', text: 'Fixed CSV export functionality' },
                    { type: 'changed', text: 'Updated dependencies to latest versions' }
                ],
                downloadUrl: 'https://example.com/v1.1.5',
                releaseNotes: 'Security update with important fixes for data export.'
            },
            {
                id: 4,
                version: '1.1.0',
                releaseDate: '2025-09-01',
                status: 'installed',
                size: '42.3 MB',
                type: 'minor',
                priority: 'high',
                changelog: [
                    { type: 'added', text: 'New dashboard analytics features' },
                    { type: 'added', text: 'User preference settings' },
                    { type: 'removed', text: 'Deprecated legacy chart components' },
                    { type: 'changed', text: 'Redesigned user interface' }
                ],
                downloadUrl: 'https://example.com/v1.1.0',
                releaseNotes: 'Major UI overhaul with new analytics dashboard and user settings.'
            },
            {
                id: 5,
                version: '1.0.8',
                releaseDate: '2025-08-25',
                status: 'installed',
                size: '41.7 MB',
                type: 'patch',
                priority: 'medium',
                changelog: [
                    { type: 'fixed', text: 'Database connection timeout issues' },
                    { type: 'fixed', text: 'Notification sound not playing' },
                    { type: 'changed', text: 'Optimized application startup time' }
                ],
                downloadUrl: 'https://example.com/v1.0.8',
                releaseNotes: 'Performance improvements and critical bug fixes.'
            }
        ];

        setTimeout(() => {
            setUpdateHistory(mockHistory);
            setCurrentVersion(mockHistory[0]?.version || '1.0.0');
            setLoading(false);
        }, 1000);
    }, []);

    const getStatusBadge = (status) => {
        const statusConfig = {
            current: { color: 'bg-green-100 text-green-800', icon: <FaCheckCircle className="w-3 h-3" />, text: 'Current' },
            installed: { color: 'bg-blue-100 text-blue-800', icon: <FaDownload className="w-3 h-3" />, text: 'Installed' },
            available: { color: 'bg-yellow-100 text-yellow-800', icon: <FaClock className="w-3 h-3" />, text: 'Available' },
            downloading: { color: 'bg-orange-100 text-orange-800', icon: <FaClock className="w-3 h-3 animate-spin" />, text: 'Downloading' }
        };

        const config = statusConfig[status] || statusConfig.installed;
        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.icon}
                <span className="ml-1">{config.text}</span>
            </span>
        );
    };

    const getTypeIcon = (type) => {
        const typeIcons = {
            major: <FaExclamationTriangle className="w-4 h-4 text-red-500" />,
            minor: <FaInfoCircle className="w-4 h-4 text-blue-500" />,
            patch: <FaBug className="w-4 h-4 text-green-500" />
        };
        return typeIcons[type] || typeIcons.patch;
    };

    const getChangeIcon = (changeType) => {
        const changeIcons = {
            added: <FaPlus className="w-3 h-3 text-green-500" />,
            changed: <FaCode className="w-3 h-3 text-blue-500" />,
            fixed: <FaBug className="w-3 h-3 text-yellow-500" />,
            removed: <FaTrash className="w-3 h-3 text-red-500" />,
            security: <FaShield className="w-3 h-3 text-purple-500" />
        };
        return changeIcons[changeType] || changeIcons.changed;
    };

    const getPriorityColor = (priority) => {
        const priorityColors = {
            high: 'border-l-red-500 bg-red-50',
            medium: 'border-l-yellow-500 bg-yellow-50',
            low: 'border-l-green-500 bg-green-50'
        };
        return priorityColors[priority] || priorityColors.medium;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Loading update history...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            >
                                <FaArrowLeft className="w-5 h-5" />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Update History</h1>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <FaCode className="w-4 h-4" />
                            <span>Current Version: {currentVersion}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <FaCheckCircle className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Updates</p>
                                <p className="text-2xl font-bold text-gray-900">{updateHistory.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <FaDownload className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Installed</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {updateHistory.filter(u => u.status === 'installed' || u.status === 'current').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <FaClock className="w-6 h-6 text-yellow-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {updateHistory.filter(u => u.status === 'available').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <FaCalendarAlt className="w-6 h-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Last Update</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(updateHistory[0]?.releaseDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Timeline */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Version History</h2>
                    </div>

                    <div className="p-6">
                        <div className="flow-root">
                            <ul className="-mb-8">
                                {updateHistory.map((update, updateIdx) => (
                                    <li key={update.id}>
                                        <div className="relative pb-8">
                                            {updateIdx !== updateHistory.length - 1 ? (
                                                <span
                                                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200"
                                                    aria-hidden="true"
                                                />
                                            ) : null}

                                            <div className="relative flex items-start space-x-3">
                                                {/* Timeline icon */}
                                                <div className={`relative px-1`}>
                                                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center ring-8 ring-white">
                                                        {getTypeIcon(update.type)}
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className={`min-w-0 flex-1 border-l-4 ${getPriorityColor(update.priority)} rounded-lg p-6`}>
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <h3 className="text-lg font-semibold text-gray-900">
                                                                Version {update.version}
                                                            </h3>
                                                            {getStatusBadge(update.status)}
                                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                {update.type}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-500 flex items-center space-x-4">
                                                            <span className="flex items-center">
                                                                <FaCalendarAlt className="w-4 h-4 mr-1" />
                                                                {new Date(update.releaseDate).toLocaleDateString()}
                                                            </span>
                                                            <span>{update.size}</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-600 mb-4">{update.releaseNotes}</p>

                                                    {/* Changelog */}
                                                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                        <h4 className="font-medium text-gray-900 mb-3">Changes:</h4>
                                                        <ul className="space-y-2">
                                                            {update.changelog.map((change, changeIdx) => (
                                                                <li key={changeIdx} className="flex items-start space-x-2">
                                                                    {getChangeIcon(change.type)}
                                                                    <span className="text-sm text-gray-700 capitalize">
                                                                        <span className="font-medium">{change.type}:</span> {change.text}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="mt-4 flex items-center space-x-3">
                                                        {update.status === 'available' && (
                                                            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                                                <FaDownload className="w-4 h-4 mr-2" />
                                                                Download
                                                            </button>
                                                        )}
                                                        <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                                                            View Details
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        Updates are automatically checked daily.
                        <button className="ml-1 text-blue-600 hover:text-blue-800 underline">
                            Check for updates now
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UpdateHistoryPage;
