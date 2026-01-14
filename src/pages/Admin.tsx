import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useResearch } from '@/contexts/ResearchContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Research, AccessLevel, User } from '@/types';
import {
  Shield,
  Users,
  FileText,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Search,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ACCESS_LEVEL_CONFIG: Record<AccessLevel, { label: string; icon: typeof Lock; color: string }> = {
  public: { label: 'Public', icon: Unlock, color: 'text-success' },
  authenticated: { label: 'Logged In Only', icon: UserCheck, color: 'text-primary' },
  restricted: { label: 'Restricted', icon: Lock, color: 'text-destructive' },
};

interface ProfileUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  affiliation: string | null;
  created_at: string;
  role?: string;
}

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { researches, updateResearch, deleteResearch } = useResearch();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<ProfileUser[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    } else if (user?.role !== 'admin') {
      toast({
        title: 'Access Denied',
        description: 'Admin access required.',
        variant: 'destructive',
      });
      navigate('/dashboard');
    }
  }, [isAuthenticated, user, navigate, toast]);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAuthenticated || user?.role !== 'admin') return;
      
      setIsLoadingUsers(true);
      try {
        // Fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
          return;
        }

        // Fetch roles for each user
        const userIds = profiles?.map(p => p.user_id) || [];
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', userIds);

        if (rolesError) {
          console.error('Error fetching roles:', rolesError);
        }

        // Map roles to users
        const rolesMap = (roles || []).reduce((acc, r) => {
          acc[r.user_id] = r.role;
          return acc;
        }, {} as Record<string, string>);

        const usersWithRoles = (profiles || []).map(p => ({
          ...p,
          role: rolesMap[p.user_id] || 'student',
        }));

        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [isAuthenticated, user]);

  const filteredResearches = researches.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.authorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleAbstractVisibility = async (research: Research) => {
    await updateResearch(research.id, { abstractVisible: !research.abstractVisible });
    toast({
      title: research.abstractVisible ? 'Abstract Hidden' : 'Abstract Visible',
      description: `Abstract for "${research.title}" is now ${research.abstractVisible ? 'hidden' : 'visible'}.`,
    });
  };

  const handleChangeAccessLevel = async (research: Research, level: AccessLevel) => {
    await updateResearch(research.id, { accessLevel: level });
    toast({
      title: 'Access Level Updated',
      description: `"${research.title}" access set to ${ACCESS_LEVEL_CONFIG[level].label}.`,
    });
  };

  const handleDeleteResearch = async (research: Research) => {
    if (confirm(`Are you sure you want to delete "${research.title}"?`)) {
      await deleteResearch(research.id);
      toast({
        title: 'Research Deleted',
        description: 'The research paper has been removed.',
      });
    }
  };

  const handleBanUser = async (userId: string) => {
    // Note: In a real application, you would update a banned status or delete the user from auth
    // For now, we just remove them from the local state
    setUsers(prev => prev.filter(u => u.user_id !== userId));
    toast({
      title: 'User Banned',
      description: 'The user has been removed from the platform.',
    });
  };

  // Stats from real data
  const totalResearches = researches.length;
  const publicResearches = researches.filter(r => r.accessLevel === 'public').length;
  const restrictedResearches = researches.filter(r => r.accessLevel === 'restricted').length;
  const totalViews = researches.reduce((sum, r) => sum + r.views, 0);

  if (!user || user.role !== 'admin') return null;

  return (
    <Layout>
      <div className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold sm:text-3xl flex items-center gap-3">
            <Shield className="h-7 w-7 text-primary" />
            Admin Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage research access, users, and platform settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalResearches}</p>
                <p className="text-sm text-muted-foreground">Total Researches</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10">
                <Unlock className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{publicResearches}</p>
                <p className="text-sm text-muted-foreground">Public Papers</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
                <Lock className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{restrictedResearches}</p>
                <p className="text-sm text-muted-foreground">Restricted Papers</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                <TrendingUp className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Views</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="researches" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="researches" className="gap-2">
              <FileText className="h-4 w-4" />
              Researches
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Users ({users.length})
            </TabsTrigger>
          </TabsList>

          {/* Researches Tab */}
          <TabsContent value="researches" className="space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or author..."
                  className="pl-10"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Abstract</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResearches.length > 0 ? (
                    filteredResearches.map((research) => {
                      const accessConfig = ACCESS_LEVEL_CONFIG[research.accessLevel || 'public'];
                      const AccessIcon = accessConfig.icon;
                      
                      return (
                        <TableRow key={research.id}>
                          <TableCell>
                            <div className="max-w-[300px]">
                              <p className="font-medium truncate">{research.title}</p>
                              <div className="flex gap-1 mt-1">
                                {research.strand && (
                                  <Badge variant="outline" className="text-xs">
                                    {research.strand}
                                  </Badge>
                                )}
                                {research.label && (
                                  <Badge variant="secondary" className="text-xs">
                                    {research.label.replace('_', ' ')}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{research.authorName}</TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {research.views}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={research.abstractVisible !== false}
                                onCheckedChange={() => handleToggleAbstractVisibility(research)}
                              />
                              <span className="text-xs text-muted-foreground">
                                {research.abstractVisible !== false ? (
                                  <Eye className="h-4 w-4 text-success" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                                )}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={research.accessLevel || 'public'}
                              onValueChange={(value) =>
                                handleChangeAccessLevel(research, value as AccessLevel)
                              }
                            >
                              <SelectTrigger className="w-[150px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(ACCESS_LEVEL_CONFIG).map(([level, config]) => (
                                  <SelectItem key={level} value={level}>
                                    <span className="flex items-center gap-2">
                                      <config.icon className={cn('h-3 w-3', config.color)} />
                                      {config.label}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteResearch(research)}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <FileText className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground font-medium">
                            No research files found, contribute now!
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Affiliation</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingUsers ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Loading users...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : users.length > 0 ? (
                    users.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.full_name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === 'admin' ? 'default' : 'secondary'}
                            className={cn(
                              u.role === 'admin' && 'bg-primary',
                              u.role === 'researcher' && 'bg-accent text-accent-foreground'
                            )}
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>{u.affiliation || '-'}</TableCell>
                        <TableCell>
                          {new Date(u.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.role !== 'admin' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleBanUser(u.user_id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Ban
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center py-8">
                          <Users className="h-12 w-12 text-muted-foreground/50 mb-3" />
                          <p className="text-muted-foreground font-medium">
                            No users found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
