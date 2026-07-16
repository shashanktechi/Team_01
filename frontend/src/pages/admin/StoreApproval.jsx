import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import StatusBadge from '../../components/StatusBadge';
import { Store, CheckCircle, XCircle, MapPin, Phone, Image, FileText, UserCheck, ShieldAlert, Mail } from 'lucide-react';

const StoreApproval = () => {
  const { storeId } = useParams();
  const [activeTab, setActiveTab] = useState('STORES'); // STORES or DELIVERY
  const [stores, setStores] = useState([]);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadData = () => {
    setLoading(true);
    Promise.all([
      adminApi.getPendingStores().catch(() => []),
      adminApi.getPendingDeliveryPartners().catch(() => [])
    ]).then(([storesList, deliveryList]) => {
      setStores(Array.isArray(storesList) ? storesList : []);
      setDeliveryPartners(Array.isArray(deliveryList) ? deliveryList : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [storeId]);

  const handleVerifyStore = async (id, status) => {
    setUpdating(`STORE-${id}-${status}`);
    try {
      await adminApi.verifyStore(id, status);
      setSuccessMsg(`Store ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
      loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating('');
    }
  };

  const handleVerifyDelivery = async (id, status) => {
    setUpdating(`DELIVERY-${id}-${status}`);
    try {
      await adminApi.verifyDeliveryPartner(id, status);
      setSuccessMsg(`Delivery Agent ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
      loadData();
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating('');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Approvals Console</h1>
        
        {/* Tabs switcher */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1.5 rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
          <button
            onClick={() => setActiveTab('STORES')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'STORES'
                ? 'bg-white dark:bg-gray-700 text-teal shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-teal'
            }`}
          >
            Stores ({stores.length})
          </button>
          <button
            onClick={() => setActiveTab('DELIVERY')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'DELIVERY'
                ? 'bg-white dark:bg-gray-700 text-teal shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-teal'
            }`}
          >
            Delivery Agents ({deliveryPartners.length})
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 text-emerald-700 dark:text-emerald-400 text-sm px-4 py-3 rounded-xl font-semibold">
          {successMsg}
        </div>
      )}

      {activeTab === 'STORES' ? (
        stores.length === 0 ? (
          <EmptyState title="No pending stores" description="All store registration requests have been reviewed." icon={Store} />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {stores.map((store) => (
              <div key={store.id} className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm overflow-hidden flex flex-col justify-between">
                <div>
                  {store.bannerUrl ? (
                    <img src={store.bannerUrl} alt="Banner" className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-gradient-to-br from-teal/20 to-teal-light/10 flex items-center justify-center">
                      <Store size={36} className="text-teal/40" />
                    </div>
                  )}

                  <div className="p-5 space-y-4">
                    <div className="flex items-start gap-3">
                      {store.logoUrl ? (
                        <img src={store.logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-gray-700 shadow" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center flex-shrink-0"><Store size={22} /></div>
                      )}
                      <div>
                        <h3 className="font-extrabold text-gray-900 dark:text-white">{store.name}</h3>
                        <StatusBadge status={store.verificationStatus} />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      {store.address && (
                        <p className="flex items-start gap-2"><MapPin size={14} className="text-teal mt-0.5 flex-shrink-0" />{store.address}</p>
                      )}
                      {store.whatsappNumber && (
                        <p className="flex items-center gap-2"><Phone size={14} className="text-teal flex-shrink-0" />{store.whatsappNumber}</p>
                      )}
                      <p className="flex items-center gap-2 text-xs">
                        <span className="font-semibold">Freshness Score:</span> {parseFloat(store.freshnessScore || 5.0).toFixed(1)}
                      </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText size={14} className="text-gray-400" />
                        <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Verification Documents</h4>
                      </div>
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                        Not yet submitted — document upload (shop license, ID proof) is a planned feature. Approve or reject based on other information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <div className="flex gap-3 pt-1 border-t border-gray-50 dark:border-gray-700/30">
                    <button
                      onClick={() => handleVerifyStore(store.id, 'APPROVED')}
                      disabled={!!updating}
                      id={`approve-store-${store.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-teal text-white rounded-xl hover:bg-teal-dark transition-all shadow-md shadow-teal/20 disabled:opacity-50"
                    >
                      <CheckCircle size={16} />
                      {updating === `STORE-${store.id}-APPROVED` ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleVerifyStore(store.id, 'REJECTED')}
                      disabled={!!updating}
                      id={`reject-store-${store.id}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-400 border border-red-200/50 dark:border-red-800/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-50"
                    >
                      <XCircle size={16} />
                      {updating === `STORE-${store.id}-REJECTED` ? 'Rejecting...' : 'Reject'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        deliveryPartners.length === 0 ? (
          <EmptyState title="No pending delivery agents" description="All delivery agent registration requests have been reviewed." icon={UserCheck} />
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {deliveryPartners.map((agent) => (
              <div key={agent.id} className="bg-white dark:bg-gray-800 rounded-card border border-gray-100 dark:border-gray-700/50 shadow-sm p-5 space-y-4 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center flex-shrink-0">
                      <UserCheck size={22} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-gray-900 dark:text-white">{agent.fullName || 'Unnamed Agent'}</h3>
                      <StatusBadge status={agent.verificationStatus} />
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <p className="flex items-center gap-2"><Phone size={14} className="text-teal flex-shrink-0" /> {agent.phone}</p>
                    {agent.email && (
                      <p className="flex items-center gap-2"><Mail size={14} className="text-teal flex-shrink-0" /> {agent.email}</p>
                    )}
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-3.5 border border-gray-100 dark:border-gray-700/50">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FileText size={14} className="text-gray-400" />
                      <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Driver Documents</h4>
                    </div>
                    {agent.vehicleDocUrl ? (
                      <a
                        href={agent.vehicleDocUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-teal hover:underline font-bold flex items-center gap-1"
                      >
                        <Image size={12} /> View Uploaded License/Document
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400 dark:text-gray-500 italic">No document uploaded.</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-50 dark:border-gray-700/30">
                  <button
                    onClick={() => handleVerifyDelivery(agent.id, 'APPROVED')}
                    disabled={!!updating}
                    id={`approve-delivery-${agent.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-teal text-white rounded-xl hover:bg-teal-dark transition-all shadow-md shadow-teal/20 disabled:opacity-50"
                  >
                    <CheckCircle size={16} />
                    {updating === `DELIVERY-${agent.id}-APPROVED` ? 'Approving...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleVerifyDelivery(agent.id, 'REJECTED')}
                    disabled={!!updating}
                    id={`reject-delivery-${agent.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-400 border border-red-200/50 dark:border-red-800/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-all disabled:opacity-50"
                  >
                    <XCircle size={16} />
                    {updating === `DELIVERY-${agent.id}-REJECTED` ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default StoreApproval;
