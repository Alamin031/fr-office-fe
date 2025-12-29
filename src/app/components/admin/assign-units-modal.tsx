'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card } from '../../components/ui/card';
import { toast } from 'sonner';
import ordersService from '../../lib/api/services/orders';
import type { Order, OrderItem } from '../../types/index';

interface AssignUnitsModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface UnitInput {
  imei?: string;
  serial?: string;
}

export function AssignUnitsModal({
  open,
  order,
  onClose,
  onSuccess,
}: AssignUnitsModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [unitsByItem, setUnitsByItem] = useState<
    Record<string, UnitInput[]>
  >({});

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setUnitsByItem({});
  };

  const initializeForm = (order: Order) => {
    const initialized: Record<string, UnitInput[]> = {};
    order.items.forEach((item) => {
      initialized[item.id] = Array(item.quantity)
        .fill(null)
        .map(() => ({ imei: '', serial: '' }));
    });
    setUnitsByItem(initialized);
  };

  const handleUnitChange = (
    orderItemId: string,
    unitIndex: number,
    field: 'imei' | 'serial',
    value: string,
  ) => {
    setUnitsByItem((prev) => ({
      ...prev,
      [orderItemId]: prev[orderItemId].map((unit, idx) =>
        idx === unitIndex ? { ...unit, [field]: value } : unit,
      ),
    }));
  };

  const handleSubmit = async () => {
    if (!order) return;

    setIsLoading(true);
    try {
      const assignmentData = Object.entries(unitsByItem)
        .filter(([_, units]) => units.some((u) => u.imei || u.serial))
        .map(([orderItemId, units]) => ({
          orderItemId,
          units: units.filter((u) => u.imei || u.serial),
        }));

      if (assignmentData.length === 0) {
        toast.error('Please enter at least one IMEI or Serial number');
        return;
      }

      await ordersService.assignUnitsAdmin(order.id, assignmentData);
      toast.success('Units assigned successfully');
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error assigning units:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to assign units. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign IMEI / Serial Numbers</DialogTitle>
          <DialogDescription>
            {order
              ? `Assign physical units (IMEI/Serial) for order ${order.orderNumber}`
              : 'Assign physical units (IMEI/Serial) to order items'}
          </DialogDescription>
        </DialogHeader>

        {order && (
          <div className="space-y-6">
            {order.items.map((item) => {
              const itemUnits = unitsByItem[item.id] || [];
              return (
                <Card key={item.id} className="p-4">
                  <div className="mb-4">
                    <h3 className="font-semibold">
                      {item.product?.name || 'Product'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity} | Price:{' '}
                      {item.price.toLocaleString('en-BD', {
                        currency: 'BDT',
                        style: 'currency',
                      })}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {itemUnits.map((unit, unitIdx) => (
                      <div
                        key={`${item.id}-${unitIdx}`}
                        className="grid gap-4 p-3 bg-muted/50 rounded border border-border"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">
                            Unit {unitIdx + 1} of {item.quantity}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor={`imei-${item.id}-${unitIdx}`}>
                              IMEI (Optional)
                            </Label>
                            <Input
                              id={`imei-${item.id}-${unitIdx}`}
                              placeholder="e.g., 356789..."
                              value={unit.imei}
                              onChange={(e) =>
                                handleUnitChange(
                                  item.id,
                                  unitIdx,
                                  'imei',
                                  e.target.value,
                                )
                              }
                              disabled={isLoading}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`serial-${item.id}-${unitIdx}`}>
                              Serial (Optional)
                            </Label>
                            <Input
                              id={`serial-${item.id}-${unitIdx}`}
                              placeholder="e.g., SN001"
                              value={unit.serial}
                              onChange={(e) =>
                                handleUnitChange(
                                  item.id,
                                  unitIdx,
                                  'serial',
                                  e.target.value,
                                )
                              }
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign Units'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
