"use client"

import { Button } from '@/app/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/app/components/ui/dialog';
import { Input } from '@/app/components/ui/input';
import { TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/app/components/ui/table';
import { deliveryService, DeliveryMethod } from '@/app/lib/api/services/delivery';
import { Table } from 'lucide-react';
import React, { useState, useEffect, useCallback } from 'react';



export default function DeliveryMethodsPage() {
  const [methods, setMethods] = useState<DeliveryMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', minDays: '', maxDays: '', extraFee: '' });

  // Move fetchMethods above useEffect and useCallback
  const fetchMethods = useCallback(async () => {
    setLoading(true);
    const data = await deliveryService.getAll();
    setMethods(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // Define an async function inside the effect
    const load = async () => {
      await fetchMethods();
    };
    load();
  }, [fetchMethods]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleAdd() {
    setEditId(null);
    setForm({ name: '', description: '', minDays: '', maxDays: '', extraFee: '' });
    setOpen(true);
  }

  function handleEdit(method: DeliveryMethod) {
    setEditId(method.id);
    setForm({
      name: method.name,
      description: method.description,
      minDays: method.minDays.toString(),
      maxDays: method.maxDays.toString(),
      extraFee: method.extraFee.toString(),
    });
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      minDays: Number(form.minDays),
      maxDays: Number(form.maxDays),
      extraFee: Number(form.extraFee),
    };
    if (editId) {
      await deliveryService.update(editId, payload);
    } else {
      await deliveryService.create(payload);
    }
    setOpen(false);
    fetchMethods();
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this delivery method?')) {
      await deliveryService.delete(id);
      fetchMethods();
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Delivery Methods</h1>
        <Button onClick={handleAdd}>Add Delivery Method</Button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Description</th>
              <th className="px-4 py-2 text-left">Min Days</th>
              <th className="px-4 py-2 text-left">Max Days</th>
              <th className="px-4 py-2 text-left">Extra Fee</th>
              <th className="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2">{m.name}</td>
                <td className="px-4 py-2">{m.description}</td>
                <td className="px-4 py-2">{m.minDays}</td>
                <td className="px-4 py-2">{m.maxDays}</td>
                <td className="px-4 py-2">{m.extraFee}</td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(m)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(m.id)} className="ml-2">Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {methods.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted-foreground py-8">No delivery methods found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{editId ? 'Edit' : 'Add'} Delivery Method</DialogTitle>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <Input name="name" value={form.name} onChange={handleChange} placeholder="Name" required />
            <Input name="description" value={form.description} onChange={handleChange} placeholder="Description" required />
            <Input name="minDays" value={form.minDays} onChange={handleChange} placeholder="Min Days" type="number" required />
            <Input name="maxDays" value={form.maxDays} onChange={handleChange} placeholder="Max Days" type="number" required />
            <Input name="extraFee" value={form.extraFee} onChange={handleChange} placeholder="Extra Fee" type="number" required />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
