import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { User, Loader2, CheckCircle, XCircle } from 'lucide-react';

export function SystemAdminDelivery() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      // Filter only delivery partners
      setPartners(response.data.filter(u => u.role === 'DELIVERY_PARTNER'));
    } catch (err) {
      console.error('Error fetching partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handlePartnerVerify = async (partnerId, status) => {
    let reason = '';
    if (status === 'REJECTED') {
      const promptRes = prompt('Please enter the reason for rejection (optional):');
      if (promptRes === null) return; // Cancel clicked
      reason = promptRes;
    }
    try {
      await api.put(`/admin/delivery-partners/${partnerId}/verify`, { status, reason });
      // Update local state instead of filtering out
      setPartners(partners.map(p => 
        p.id === partnerId 
          ? { ...p, verificationStatus: status, isActive: status === 'APPROVED' }
          : p
      ));
    } catch (err) {
      console.error('Error verifying partner:', err);
      alert('Failed to update delivery partner status');
    }
  };

  const handleDocumentVerify = async (partnerId, docType, verified) => {
    try {
      await api.put(`/admin/delivery-partners/${partnerId}/verify-document`, { docType, verified });
      fetchPartners(); // Refresh to get updated booleans
    } catch (err) {
      console.error('Error verifying document:', err);
      alert('Failed to verify document');
    }
  };

  const handleSendKycEmail = async (partnerId) => {
    try {
      const res = await api.post(`/admin/delivery-partners/${partnerId}/send-kyc-email`);
      alert(res.data.isApproved ? 'All docs verified. Approval email sent!' : 'Missing/rejected docs. Rejection email sent!');
      fetchPartners(); // Refresh status
    } catch (err) {
      console.error('Error sending email:', err);
      alert('Failed to send email');
    }
  };

  const filteredPartners = partners.filter(p => filterStatus === 'All' || p.verificationStatus === filterStatus);

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-black text-2xl text-ink">Delivery Agents</h2>
          <p className="font-mono text-sm text-ink-muted mt-1 uppercase tracking-wider">Manage delivery partners</p>
        </div>
      </div>

      <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
        {['All', 'PENDING', 'APPROVED', 'REJECTED'].map(status => (
          <Button
            key={status}
            variant={filterStatus === status ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus(status)}
            className="whitespace-nowrap"
          >
            {status}
          </Button>
        ))}
      </div>

      {filteredPartners.length === 0 ? (
        <div className="text-center py-12 text-ink-muted border border-dashed border-border rounded-xl">
          <p>No delivery agents found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredPartners.map(p => (
            <Card key={p.id} className="bg-surface shadow-sm border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center text-ink/50 border border-border overflow-hidden">
                  {p.profilePhotoUrl ? (
                    <img src={p.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover cursor-pointer" onClick={() => setSelectedImage(p.profilePhotoUrl)} />
                  ) : (
                    <User className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-ink leading-tight flex items-center gap-2">
                    {p.fullName}
                    <Badge variant={
                      p.verificationStatus === 'APPROVED' ? 'bazaar-green' : 
                      p.verificationStatus === 'PENDING' ? 'warning' : 'chalk'
                    } className="text-xs">
                      {p.verificationStatus || 'PENDING'}
                    </Badge>
                  </h3>
                  <p className="font-body text-sm text-ink-muted">{p.email} • {p.phone}</p>
                      {p.vehicleName && (
                        <p className="font-body text-xs text-ink-muted bg-ink/5 inline-block px-2 py-1 rounded w-fit mb-2">
                          Vehicle: {p.vehicleName} {p.vehicleModel ? `(${p.vehicleModel})` : ''} • {p.vehicleNumber}
                        </p>
                      )}
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2 bg-surface p-4 rounded-lg border border-border">
                        {[
                          { key: 'ssc', label: 'SSC', url: p.sscCertUrl, verified: p.sscVerified },
                          { key: 'inter', label: 'Inter', url: p.interCertUrl, verified: p.interVerified },
                          { key: 'driverLicense', label: 'Driver License', url: p.driverLicenseUrl, verified: p.driverLicenseVerified },
                          { key: 'bikeRc', label: 'Bike RC', url: p.bikeRcUrl, verified: p.bikeRcVerified },
                          { key: 'otherCert', label: 'Other Cert', url: p.otherCertUrl, verified: p.otherCertVerified },
                          { key: 'aadhar', label: 'Aadhar', url: p.aadharUrl, verified: p.aadharVerified }
                        ].map((doc) => (
                          <div key={doc.key} className="flex flex-col gap-2 p-2 border border-border/50 rounded-md">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-ink">{doc.label}</span>
                              {doc.verified ? <CheckCircle className="w-3 h-3 text-bazaar-green" /> : <XCircle className="w-3 h-3 text-danger" />}
                            </div>
                            {doc.url ? (
                              <button 
                                onClick={() => setSelectedImage(doc.url)}
                                className="text-xs text-primary underline w-fit text-left"
                              >
                                View Doc
                              </button>
                            ) : (
                              <span className="text-xs text-ink-muted italic">Not Uploaded</span>
                            )}
                            <div className="flex gap-1 mt-auto pt-2">
                              <Button variant="outline" size="sm" className="w-full text-[10px] h-6 px-1 border-bazaar-green text-bazaar-green hover:bg-bazaar-green/10"
                                onClick={() => handleDocumentVerify(p.id, doc.key, true)}>
                                Verify
                              </Button>
                              <Button variant="outline" size="sm" className="w-full text-[10px] h-6 px-1 border-danger text-danger hover:bg-danger/10"
                                onClick={() => handleDocumentVerify(p.id, doc.key, false)}>
                                Reject
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>

                    </div>
                  </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto p-4 sm:p-0 border-t border-border sm:border-0 mt-4 sm:mt-0">
                <Button variant="primary" size="sm" onClick={() => handleSendKycEmail(p.id)} className="w-full sm:w-48 bg-primary hover:bg-primary-dark">
                  Send Final KYC Mail
                </Button>
                {p.verificationStatus === 'APPROVED' && (
                  <Button variant="outline" size="sm" onClick={() => handlePartnerVerify(p.id, 'REJECTED')} className="w-full sm:w-48">
                    Revoke Access
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[90vh] w-full bg-surface rounded-2xl overflow-hidden p-2">
            <button className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70" onClick={() => setSelectedImage(null)}>
              <XCircle className="w-6 h-6" />
            </button>
            {selectedImage.toLowerCase().endsWith('.pdf') ? (
              <iframe src={selectedImage} className="w-full h-[80vh] border-0" title="PDF Document" />
            ) : (
              <img src={selectedImage} alt="Document View" className="w-full h-full object-contain" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
