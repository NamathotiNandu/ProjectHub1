import { useState } from 'react';
import { useProjects } from '@/contexts/ProjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Clock, User, MessageSquare } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

const COLUMNS = [
  { id: 'todo', title: 'To Do', color: 'bg-muted' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-secondary/20' },
  { id: 'done', title: 'Done', color: 'bg-accent/20' }
];

export default function KanbanBoard({ projectId }) {
  const { getProjectById, addTask, updateTask, deleteTask, addComment } = useProjects();
  const { user } = useAuth();
  const [showAddTask, setShowAddTask] = useState(null);
  const [showTaskDetail, setShowTaskDetail] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [commentText, setCommentText] = useState('');
  
  const project = getProjectById(projectId);
  const tasks = project?.tasks || [];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleAddTask = (columnId) => {
    if (!newTaskTitle.trim()) {
      toast.error('Please enter a task title');
      return;
    }

    addTask(projectId, {
      title: newTaskTitle,
      description: '',
      status: columnId,
      priority: 'medium',
      assignedTo: user?.id
    });

    toast.success('Task added successfully');
    setNewTaskTitle('');
    setShowAddTask(null);
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(projectId, taskId, { status: newStatus });
    toast.success('Task status updated');
  };

  const handleDeleteTask = (taskId) => {
    deleteTask(projectId, taskId);
    toast.success('Task deleted');
    setShowTaskDetail(null);
  };

  const handleAddComment = (taskId) => {
    if (!commentText.trim()) return;

    addComment(projectId, taskId, {
      text: commentText
    });

    setCommentText('');
    toast.success('Comment added');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-destructive text-destructive-foreground';
      case 'medium':
        return 'bg-warning text-warning-foreground';
      case 'low':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Task Board</h3>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{tasks.length} total tasks</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <Card key={column.id} className={`${column.color} border-2`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {column.title}
                  </CardTitle>
                  <Badge variant="secondary">{columnTasks.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ScrollArea className="h-[500px] pr-3">
                  <div className="space-y-3">
                    {columnTasks.map((task) => (
                      <Card
                        key={task.id}
                        className="cursor-pointer hover:shadow-md transition-all border bg-card"
                        onClick={() => setShowTaskDetail(task)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-medium text-sm line-clamp-2">{task.title}</h4>
                            <Badge className={getPriorityColor(task.priority)} variant="secondary">
                              {task.priority}
                            </Badge>
                          </div>
                          
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{user?.name || 'Unassigned'}</span>
                            </div>
                            {task.comments && task.comments.length > 0 && (
                              <div className="flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                <span>{task.comments.length}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {showAddTask === column.id ? (
                      <Card className="border-2 border-dashed border-primary">
                        <CardContent className="p-3 space-y-2">
                          <Input
                            placeholder="Enter task title..."
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddTask(column.id);
                              if (e.key === 'Escape') setShowAddTask(null);
                            }}
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleAddTask(column.id)}>
                              Add
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowAddTask(null);
                                setNewTaskTitle('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <Button
                        variant="ghost"
                        className="w-full border-2 border-dashed hover:border-primary"
                        onClick={() => setShowAddTask(column.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Task
                      </Button>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Task Detail Dialog */}
      <Dialog open={!!showTaskDetail} onOpenChange={() => setShowTaskDetail(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
            <DialogDescription>
              View and manage task information
            </DialogDescription>
          </DialogHeader>

          {showTaskDetail && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <h3 className="text-lg font-semibold mt-1">{showTaskDetail.title}</h3>
                </div>

                {showTaskDetail.description && (
                  <div>
                    <Label>Description</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {showTaskDetail.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={showTaskDetail.status}
                      onValueChange={(value) => handleStatusChange(showTaskDetail.id, value)}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COLUMNS.map(col => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <div className="mt-1">
                      <Badge className={getPriorityColor(showTaskDetail.priority)}>
                        {showTaskDetail.priority}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Created</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(showTaskDetail.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="space-y-3">
                <Label>Comments ({showTaskDetail.comments?.length || 0})</Label>
                <ScrollArea className="h-40 border rounded-lg p-3">
                  <div className="space-y-3">
                    {showTaskDetail.comments && showTaskDetail.comments.length > 0 ? (
                      showTaskDetail.comments.map((comment) => (
                        <div key={comment.id} className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">{comment.userName}</span>
                            <span className="text-muted-foreground">
                              {new Date(comment.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{comment.text}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No comments yet
                      </p>
                    )}
                  </div>
                </ScrollArea>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(showTaskDetail.id);
                      }
                    }}
                  />
                  <Button onClick={() => handleAddComment(showTaskDetail.id)}>
                    Send
                  </Button>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteTask(showTaskDetail.id)}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </Button>
                <Button variant="outline" onClick={() => setShowTaskDetail(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
