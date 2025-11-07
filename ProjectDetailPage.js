import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/contexts/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, Calendar, Target, FileText, BarChart3 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import KanbanBoard from '@/components/projects/KanbanBoard';
import ProjectSubmissions from '@/components/projects/ProjectSubmissions';
import ProjectAnalytics from '@/components/projects/ProjectAnalytics';
import SubmitProjectDialog from '@/components/projects/SubmitProjectDialog';
import { toast } from 'sonner';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isTeacher } = useAuth();
  const { getProjectById, updateProject } = useProjects();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  const project = getProjectById(id);

  useEffect(() => {
    if (!project) {
      toast.error('Project not found');
      navigate('/dashboard');
    }
  }, [project, navigate]);

  if (!project) return null;

  const completedTasks = project.tasks?.filter(t => t.status === 'done').length || 0;
  const totalTasks = project.tasks?.length || 0;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Update project progress
  useEffect(() => {
    if (project && progress !== project.progress) {
      updateProject(project.id, { progress });
    }
  }, [progress, project, updateProject]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-accent text-accent-foreground';
      case 'submitted':
        return 'bg-secondary text-secondary-foreground';
      case 'completed':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const isOverdue = new Date(project.dueDate) < new Date() && project.status === 'active';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex flex-col lg:flex-row justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-3 mb-2">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                {isOverdue && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
              </div>
              <p className="text-muted-foreground text-lg">{project.description}</p>
            </div>

            {!isTeacher && project.status === 'active' && (
              <Button
                size="lg"
                onClick={() => setShowSubmitDialog(true)}
                className="lg:self-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Submit Project
              </Button>
            )}
          </div>
        </div>

        {/* Project Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progress
              </CardTitle>
              <Target className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{progress}%</div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {completedTasks} of {totalTasks} tasks completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Due Date
              </CardTitle>
              <Calendar className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold mb-1 ${isOverdue ? 'text-destructive' : ''}`}>
                {new Date(project.dueDate).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {isOverdue ? 'Past due date' : `${Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days remaining`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Team Members
              </CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {project.assignedStudents?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {isTeacher ? 'Students assigned' : 'Team members'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="board" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="board" className="gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Kanban Board</span>
              <span className="sm:hidden">Board</span>
            </TabsTrigger>
            <TabsTrigger value="submissions" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Submissions</span>
              <span className="sm:hidden">Submit</span>
              {project.submissions && project.submissions.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {project.submissions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
              <span className="sm:hidden">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-4">
            <KanbanBoard projectId={project.id} />
          </TabsContent>

          <TabsContent value="submissions" className="space-y-4">
            <ProjectSubmissions project={project} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <ProjectAnalytics project={project} />
          </TabsContent>
        </Tabs>
      </div>

      <SubmitProjectDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        projectId={project.id}
      />
    </DashboardLayout>
  );
}
