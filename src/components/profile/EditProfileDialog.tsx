import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProfileDialog({ open, onOpenChange }: EditProfileDialogProps) {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [affiliation, setAffiliation] = useState(user?.affiliation || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast({
        title: 'Error',
        description: 'Full name is required.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    updateProfile({
      fullName: fullName.trim(),
      affiliation: affiliation.trim() || undefined,
      bio: bio.trim() || undefined,
    });

    setIsLoading(false);
    
    toast({
      title: 'Profile Updated',
      description: 'Your profile has been successfully updated.',
    });
    
    onOpenChange(false);
  };

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setFullName(user?.fullName || '');
      setAffiliation(user?.affiliation || '');
      setBio(user?.bio || '');
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Update your personal information.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="affiliation">Strand</Label>
            <Input
              id="affiliation"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="e.g. STEM, HUMSS, ABM, ICT, GAS, Other"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              className="min-h-[100px] resize-y"
            />
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
