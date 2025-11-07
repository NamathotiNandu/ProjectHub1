import { useState } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function SubmitProjectDialog({ open, onOpenChange, projectId }) {
  const { submitProject } = useProjects();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      submitProject(projectId, formData);
      toast.success('Project submitted successfully!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        fileUrl: ''
      });
    } catch (error) {
      toast.error('Failed to submit project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Submit Project</DialogTitle>
          <DialogDescription>
            Submit your completed project work for review
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Submission Title *</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., Final Project Submission"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe your work, methodology, and key findings..."
              value={formData.description}
              onChange={handleChange}
              rows={5}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="fileUrl">File/Document URL</Label>
            <Input
              id="fileUrl"
              name="fileUrl"
              type="url"
              placeholder="https://drive.google.com/..."
              value={formData.fileUrl}
              onChange={handleChange}
            />
            <p className="text-xs text-muted-foreground">
              Link to Google Drive, Dropbox, or any hosted file (optional)
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
