'use client'

import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Eye, MoreVertical, X, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Checkbox } from '../../components/ui/checkbox'
import { faqsService } from '../../lib/api'
import { toast } from 'sonner'
import type { FAQ } from '../../lib/api/types'

export default function ProductFAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewMode, setIsViewMode] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null)
  const [publishFilter, setPublishFilter] = useState<'all' | 'published' | 'draft'>('all')

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: '',
    productId: '',
    isPublished: false,
  })

  useEffect(() => {
    fetchFAQs()
  }, [])

  useEffect(() => {
    filterFAQs()
  }, [faqs, searchQuery, publishFilter])

  const fetchFAQs = async () => {
    setLoading(true)
    try {
      const response = await faqsService.getAll(1, 100)
      setFaqs(response.data || [])
    } catch (error) {
      toast.error('Failed to fetch FAQs')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const filterFAQs = () => {
    let filtered = faqs

    if (searchQuery) {
      filtered = filtered.filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (publishFilter === 'published') {
      filtered = filtered.filter(faq => faq.isPublished)
    } else if (publishFilter === 'draft') {
      filtered = filtered.filter(faq => !faq.isPublished)
    }

    setFilteredFaqs(filtered)
  }

  const handleAddFAQ = () => {
    setFormData({
      question: '',
      answer: '',
      category: '',
      productId: '',
      isPublished: false,
    })
    setSelectedFAQ(null)
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleEditFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      productId: faq.productId || '',
      isPublished: faq.isPublished,
    })
    setIsViewMode(false)
    setIsModalOpen(true)
  }

  const handleViewFAQ = (faq: FAQ) => {
    setSelectedFAQ(faq)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category || '',
      productId: faq.productId || '',
      isPublished: faq.isPublished,
    })
    setIsViewMode(true)
    setIsModalOpen(true)
  }

  const handleSaveFAQ = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      toast.error('Question and Answer are required')
      return
    }

    setLoading(true)
    try {
      if (selectedFAQ) {
        await faqsService.update(selectedFAQ.id, formData)
        toast.success('FAQ updated successfully')
      } else {
        await faqsService.create(formData)
        toast.success('FAQ created successfully')
      }
      await fetchFAQs()
      setIsModalOpen(false)
    } catch (error) {
      toast.error('Failed to save FAQ')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFAQ = async () => {
    if (!selectedFAQ) return

    setLoading(true)
    try {
      await faqsService.delete(selectedFAQ.id)
      toast.success('FAQ deleted successfully')
      await fetchFAQs()
      setIsDeleteDialogOpen(false)
    } catch (error) {
      toast.error('Failed to delete FAQ')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleTogglePublish = async (faq: FAQ) => {
    setLoading(true)
    try {
      await faqsService.update(faq.id, { isPublished: !faq.isPublished })
      toast.success(faq.isPublished ? 'FAQ unpublished' : 'FAQ published')
      await fetchFAQs()
    } catch (error) {
      toast.error('Failed to toggle publish status')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product FAQs</h1>
          <p className="text-muted-foreground">Manage frequently asked questions for your products</p>
        </div>
        <Button onClick={handleAddFAQ} className="gap-2">
          <Plus className="h-4 w-4" />
          Add FAQ
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>FAQs List</CardTitle>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={publishFilter} onValueChange={v => setPublishFilter(v as 'all' | 'published' | 'draft')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading && !faqs.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No FAQs found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.map(faq => (
                <div
                  key={faq.id}
                  className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-medium line-clamp-2">{faq.question}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{faq.answer}</p>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          {faq.category && (
                            <Badge variant="secondary" className="text-xs">
                              {faq.category}
                            </Badge>
                          )}
                          {faq.productId && (
                            <Badge variant="outline" className="text-xs">
                              Product: {faq.productId}
                            </Badge>
                          )}
                          <Badge
                            variant={faq.isPublished ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {faq.isPublished ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewFAQ(faq)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditFAQ(faq)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleTogglePublish(faq)}>
                        {faq.isPublished ? 'Unpublish' : 'Publish'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedFAQ(faq)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isViewMode ? 'View FAQ' : selectedFAQ ? 'Edit FAQ' : 'Add New FAQ'}
            </DialogTitle>
            <DialogDescription>
              {isViewMode
                ? 'FAQ details'
                : selectedFAQ
                  ? 'Update the FAQ information'
                  : 'Create a new FAQ for your products'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                placeholder="Enter the question"
                value={formData.question}
                onChange={e => setFormData({ ...formData, question: e.target.value })}
                disabled={isViewMode}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer"
                value={formData.answer}
                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                disabled={isViewMode}
                className="min-h-32"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Shipping, Returns"
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  disabled={isViewMode}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="productId">Product ID</Label>
                <Input
                  id="productId"
                  placeholder="e.g., PRD-001"
                  value={formData.productId}
                  onChange={e => setFormData({ ...formData, productId: e.target.value })}
                  disabled={isViewMode}
                />
              </div>
            </div>

            {!isViewMode && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPublished"
                  checked={formData.isPublished}
                  onCheckedChange={checked =>
                    setFormData({ ...formData, isPublished: checked === true })
                  }
                />
                <Label htmlFor="isPublished" className="font-normal cursor-pointer">
                  Publish immediately
                </Label>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              {isViewMode ? 'Close' : 'Cancel'}
            </Button>
            {!isViewMode && (
              <Button onClick={handleSaveFAQ} disabled={loading}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {selectedFAQ ? 'Update FAQ' : 'Create FAQ'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFAQ}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
