'use client';
import {useEffect, useState} from 'react';
import {toast} from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/dialog';
import {Label} from '../../components/ui/label';
import corporateDealService, {
  CorporateDeal,
} from '../../lib/api/services/corporate';
import {withProtectedRoute} from '../../lib/auth/protected-route';

function AdminCorporatePage() {
  const [deals, setDeals] = useState<CorporateDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<CorporateDeal | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dealToDelete, setDealToDelete] = useState<CorporateDeal | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const data = await corporateDealService.getAll();
      setDeals(data);
    } catch {
      toast.error('Failed to fetch corporate deals.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDeal = (deal: CorporateDeal) => {
    setDealToDelete(deal);
    setDeleteModalOpen(true);
  };

  const confirmDeleteDeal = async () => {
    if (!dealToDelete) return;
    setLoading(true);
    try {
      await corporateDealService.delete(String(dealToDelete.id));
      await fetchDeals();
      toast.success('Corporate deal deleted successfully!');
    } catch {
      toast.error('Failed to delete corporate deal.');
    } finally {
      setLoading(false);
      setDeleteModalOpen(false);
      setDealToDelete(null);
    }
  };

  const handleEditDeal = (deal: CorporateDeal) => {
    setSelectedDeal(deal);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Corporate Deals</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Corporate Deal List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Full Name</th>
                  <th className="px-4 py-2 text-left">Company</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(deals) ? deals : []).map(deal => (
                  <tr
                    key={
                      deal.id ? deal.id.toString() : Math.random().toString()
                    }>
                    <td className="px-4 py-2">{deal.fullName}</td>
                    <td className="px-4 py-2">{deal.companyName}</td>
                    <td className="px-4 py-2">{deal.email}</td>
                    <td className="px-4 py-2">{deal.phone}</td>
                    <td className="px-4 py-2">{deal.status}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditDeal(deal)}>
                          View/Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive"
                          onClick={() => handleDeleteDeal(deal)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(Array.isArray(deals) ? deals.length : 0) === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No corporate deals found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* View Deal Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Corporate Deal Details</DialogTitle>
            <DialogDescription>
              View the selected corporate deal.
            </DialogDescription>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4 py-2">
              <div>
                <Label>Full Name</Label>
                <div className="border rounded px-3 py-2 bg-muted">
                  {selectedDeal.fullName}
                </div>
              </div>
              <div>
                <Label>Company Name</Label>
                <div className="border rounded px-3 py-2 bg-muted">
                  {selectedDeal.companyName}
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <div className="border rounded px-3 py-2 bg-muted">
                  {selectedDeal.email}
                </div>
              </div>
              <div>
                <Label>Phone</Label>
                <div className="border rounded px-3 py-2 bg-muted">
                  {selectedDeal.phone}
                </div>
              </div>
              <div>
                <Label>Message</Label>
                <div className="border rounded px-3 py-2 bg-muted">
                  {selectedDeal.message || ''}
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <div className="border rounded px-3 py-2 bg-muted">
                  {selectedDeal.status}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => setModalOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Corporate Deal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <b>{dealToDelete?.companyName}</b>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={loading}>
              Cancel
            </Button>
            <Button
              type="button"
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={confirmDeleteDeal}
              disabled={loading}>
              {loading ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default withProtectedRoute(AdminCorporatePage, {
  requiredRoles: ['admin'],
  fallbackTo: '/login',
  showLoader: true,
});
