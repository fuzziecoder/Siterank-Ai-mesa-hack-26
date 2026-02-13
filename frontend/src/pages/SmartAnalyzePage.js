import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Globe, User, Users, Eye, ArrowRight, Building2, 
  CheckCircle, Lock, Sparkles, FileText, Download
} from 'lucide-react';
import { toast } from 'sonner';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function SmartAnalyzePage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [siteType, setSiteType] = useState(null);

  const siteTypes = [
    {
      id: 'my-site',
      icon: User,
      title: 'This is MY Website',
      description: 'I own this website and want to fix issues',
      features: [
        'Generate fix code to copy-paste',
        'Connect CMS (WordPress/Shopify) to auto-apply',
        'Full optimization blueprint',
        'Ownership verification for direct fixes'
      ],
      color: 'emerald',
      bgColor: 'from-emerald-500/10 to-emerald-500/5',
      borderColor: 'border-emerald-500/30',
      route: '/analyze/my-site'
    },
    {
      id: 'client-site',
      icon: Building2,
      title: 'This is a CLIENT Website',
      description: 'I\'m an agency analyzing for a client',
      features: [
        'Professional PDF audit report',
        'Fix code package to send to client',
        'White-label export option',
        'Implementation instructions'
      ],
      color: 'cyan',
      bgColor: 'from-cyan-500/10 to-cyan-500/5',
      borderColor: 'border-cyan-500/30',
      route: '/analyze/client-site'
    },
    {
      id: 'competitor-site',
      icon: Eye,
      title: 'This is a COMPETITOR Website',
      description: 'I want to research what they\'re doing right',
      features: [
        'Competitive intelligence report',
        'What they do better than you',
        'Opportunities to outrank them',
        'Suggestions apply to YOUR site'
      ],
      color: 'purple',
      bgColor: 'from-purple-500/10 to-purple-500/5',
      borderColor: 'border-purple-500/30',
      route: '/analyze/competitor'
    }
  ];

  const handleContinue = () => {
    if (!url) {
      toast.error('Please enter a website URL');
      return;
    }
    if (!siteType) {
      toast.error('Please select your relationship to this website');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      return;
    }
    
    // Navigate to appropriate analysis page with URL
    const selectedType = siteTypes.find(t => t.id === siteType);
    navigate(`${selectedType.route}?url=${encodeURIComponent(url)}`);
  };

  const getColorClasses = (color, isSelected) => {
    const colors = {
      emerald: {
        ring: isSelected ? 'ring-2 ring-emerald-500' : '',
        text: 'text-emerald-400',
        bg: 'bg-emerald-500/20',
        check: 'text-emerald-400'
      },
      cyan: {
        ring: isSelected ? 'ring-2 ring-cyan-500' : '',
        text: 'text-cyan-400',
        bg: 'bg-cyan-500/20',
        check: 'text-cyan-400'
      },
      purple: {
        ring: isSelected ? 'ring-2 ring-purple-500' : '',
        text: 'text-purple-400',
        bg: 'bg-purple-500/20',
        check: 'text-purple-400'
      }
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-background" data-testid="smart-analyze-page">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-4">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-medium text-muted-foreground">Smart Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">
            What's your relationship to this website?
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We'll customize your analysis and available actions based on your role
          </p>
        </div>

        {/* URL Input */}
        <Card className="bg-card border-border max-w-2xl mx-auto mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter website URL (e.g., example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10 bg-muted border-border h-12 text-lg"
                data-testid="smart-url-input"
              />
            </div>
          </CardContent>
        </Card>

        {/* Site Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {siteTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = siteType === type.id;
            const colorClasses = getColorClasses(type.color, isSelected);
            
            return (
              <Card
                key={type.id}
                onClick={() => setSiteType(type.id)}
                className={`bg-gradient-to-br ${type.bgColor} border ${type.borderColor} cursor-pointer transition-all duration-300 hover:scale-[1.02] ${colorClasses.ring}`}
                data-testid={`site-type-${type.id}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${colorClasses.bg} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${colorClasses.text}`} />
                    </div>
                    {isSelected && (
                      <CheckCircle className={`w-6 h-6 ${colorClasses.check} ml-auto`} />
                    )}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {type.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  
                  <ul className="space-y-2">
                    {type.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle className={`w-4 h-4 ${colorClasses.text} flex-shrink-0`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!url || !siteType || !isAuthenticated}
            size="lg"
            className="px-8 bg-gradient-to-r from-emerald-600 via-cyan-600 to-purple-600 hover:from-emerald-500 hover:via-cyan-500 hover:to-purple-500 gap-2"
            data-testid="continue-btn"
          >
            Continue to Analysis
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-4">
              Please <a href="/login" className="text-emerald-400 hover:underline">login</a> to continue
            </p>
          )}
        </div>

        {/* Info Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-emerald-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">100% Legal</h4>
            <p className="text-sm text-muted-foreground">
              We only analyze publicly available data. No unauthorized access.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-cyan-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Generate, Don't Push</h4>
            <p className="text-sm text-muted-foreground">
              AI generates fix code. You apply it yourself (or connect your CMS).
            </p>
          </div>
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">Export Everything</h4>
            <p className="text-sm text-muted-foreground">
              Download PDF reports, fix packages, and implementation guides.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
