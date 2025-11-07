import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BookOpen, Users, GraduationCap, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all fields');
      return;
    }

    const userData = {
      id: Date.now().toString(),
      name: formData.name,
      email: formData.email,
      role: formData.role
    };

    login(userData);
    toast.success(`Welcome, ${userData.name}!`);
    navigate('/dashboard');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Welcome to ProjectHub</CardTitle>
            <CardDescription>
              Enter your information to get started
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>I am a...</Label>
                <RadioGroup
                  value={formData.role}
                  onValueChange={(value) => setFormData({ ...formData, role: value })}
                  className="grid grid-cols-2 gap-4"
                >
                  <Label
                    htmlFor="student"
                    className="flex flex-col items-center gap-3 cursor-pointer rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:border-accent transition-all"
                  >
                    <RadioGroupItem value="student" id="student" className="sr-only" />
                    <GraduationCap className={`w-8 h-8 ${formData.role === 'student' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-center">
                      <p className="font-semibold">Student</p>
                      <p className="text-xs text-muted-foreground">Work on projects</p>
                    </div>
                  </Label>

                  <Label
                    htmlFor="teacher"
                    className="flex flex-col items-center gap-3 cursor-pointer rounded-lg border-2 border-muted bg-card p-4 hover:bg-accent hover:border-accent transition-all"
                  >
                    <RadioGroupItem value="teacher" id="teacher" className="sr-only" />
                    <Users className={`w-8 h-8 ${formData.role === 'teacher' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-center">
                      <p className="font-semibold">Teacher</p>
                      <p className="text-xs text-muted-foreground">Manage projects</p>
                    </div>
                  </Label>
                </RadioGroup>
              </div>

              <Button type="submit" className="w-full" size="lg">
                Continue
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Demo app - No actual authentication required
        </p>
      </div>
    </div>
  );
}
