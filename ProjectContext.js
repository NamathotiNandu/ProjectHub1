import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ProjectContext = createContext(null);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load projects from localStorage
    const storedProjects = localStorage.getItem('projects');
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  const saveToStorage = (updatedProjects) => {
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const createProject = (projectData) => {
    const newProject = {
      id: Date.now().toString(),
      ...projectData,
      createdBy: user?.id,
      createdAt: new Date().toISOString(),
      status: 'active',
      tasks: [],
      submissions: [],
      progress: 0
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    saveToStorage(updatedProjects);
    return newProject;
  };

  const updateProject = (projectId, updates) => {
    const updatedProjects = projects.map(project =>
      project.id === projectId ? { ...project, ...updates } : project
    );
    setProjects(updatedProjects);
    saveToStorage(updatedProjects);
  };

  const deleteProject = (projectId) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    saveToStorage(updatedProjects);
  };

  const getProjectById = (projectId) => {
    return projects.find(project => project.id === projectId);
  };

  const getProjectsByUser = () => {
    if (!user) return [];
    if (user.role === 'teacher') {
      return projects.filter(project => project.createdBy === user.id);
    }
    return projects.filter(project =>
      project.assignedStudents?.includes(user.id)
    );
  };

  const addTask = (projectId, taskData) => {
    const project = getProjectById(projectId);
    if (!project) return;

    const newTask = {
      id: Date.now().toString(),
      ...taskData,
      createdAt: new Date().toISOString(),
      status: 'todo',
      comments: []
    };

    const updatedTasks = [...(project.tasks || []), newTask];
    updateProject(projectId, { tasks: updatedTasks });
    return newTask;
  };

  const updateTask = (projectId, taskId, updates) => {
    const project = getProjectById(projectId);
    if (!project) return;

    const updatedTasks = project.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    updateProject(projectId, { tasks: updatedTasks });
  };

  const deleteTask = (projectId, taskId) => {
    const project = getProjectById(projectId);
    if (!project) return;

    const updatedTasks = project.tasks.filter(task => task.id !== taskId);
    updateProject(projectId, { tasks: updatedTasks });
  };

  const addComment = (projectId, taskId, commentData) => {
    const project = getProjectById(projectId);
    if (!project) return;

    const newComment = {
      id: Date.now().toString(),
      ...commentData,
      userId: user?.id,
      userName: user?.name,
      createdAt: new Date().toISOString()
    };

    const updatedTasks = project.tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          comments: [...(task.comments || []), newComment]
        };
      }
      return task;
    });

    updateProject(projectId, { tasks: updatedTasks });
  };

  const submitProject = (projectId, submissionData) => {
    const project = getProjectById(projectId);
    if (!project) return;

    const newSubmission = {
      id: Date.now().toString(),
      ...submissionData,
      submittedBy: user?.id,
      submittedByName: user?.name,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    const updatedSubmissions = [...(project.submissions || []), newSubmission];
    updateProject(projectId, {
      submissions: updatedSubmissions,
      status: 'submitted'
    });
  };

  const value = {
    projects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByUser,
    addTask,
    updateTask,
    deleteTask,
    addComment,
    submitProject
  };

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
};
