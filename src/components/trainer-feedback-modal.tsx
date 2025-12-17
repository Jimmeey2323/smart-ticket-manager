import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Star,
  Upload,
  FileText,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Loader2,
  Calendar,
  Award,
  Target,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { TRAINERS } from "@/lib/constants";

interface TrainerFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface TrainerProfile {
  id: string;
  name: string;
  avatar?: string;
  specialization: string;
  rating: number;
  totalFeedback: number;
  trend: "up" | "down" | "stable";
  scores: {
    technique: number;
    communication: number;
    motivation: number;
    punctuality: number;
    professionalism: number;
  };
  recentFeedback: Array<{
    date: string;
    rating: number;
    comment: string;
    sentiment: "positive" | "negative" | "neutral";
  }>;
}

interface FeedbackFormData {
  trainerId: string;
  trainerName: string;
  classType: string;
  classDate: string;
  overallRating: number;
  technique: number;
  communication: number;
  motivation: number;
  punctuality: number;
  professionalism: number;
  feedback: string;
  customerName: string;
  customerEmail: string;
}

const MOCK_TRAINERS: TrainerProfile[] = TRAINERS.map((trainer, index) => ({
  id: trainer.id,
  name: trainer.name,
  avatar: undefined,
  specialization: ["Barre", "Pilates", "Yoga", "HIIT", "Strength"][index % 5],
  rating: 4.2 + (Math.random() * 0.8),
  totalFeedback: Math.floor(50 + Math.random() * 200),
  trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
  scores: {
    technique: 75 + Math.floor(Math.random() * 25),
    communication: 70 + Math.floor(Math.random() * 30),
    motivation: 80 + Math.floor(Math.random() * 20),
    punctuality: 85 + Math.floor(Math.random() * 15),
    professionalism: 78 + Math.floor(Math.random() * 22),
  },
  recentFeedback: [
    { date: "2 days ago", rating: 4.5, comment: "Great energy and clear instructions!", sentiment: "positive" as const },
    { date: "5 days ago", rating: 4.0, comment: "Good class but started a bit late.", sentiment: "neutral" as const },
    { date: "1 week ago", rating: 5.0, comment: "Best instructor ever! Amazing motivation.", sentiment: "positive" as const },
  ],
}));

const SCORE_CATEGORIES = [
  { key: "technique", label: "Technique & Form", icon: Target },
  { key: "communication", label: "Communication", icon: MessageSquare },
  { key: "motivation", label: "Motivation", icon: Award },
  { key: "punctuality", label: "Punctuality", icon: Calendar },
  { key: "professionalism", label: "Professionalism", icon: User },
];

export function TrainerFeedbackModal({ open, onOpenChange }: TrainerFeedbackModalProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("trainers");
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiInsights, setAiInsights] = useState<any>(null);
  
  const [feedbackForm, setFeedbackForm] = useState<FeedbackFormData>({
    trainerId: "",
    trainerName: "",
    classType: "",
    classDate: "",
    overallRating: 4,
    technique: 75,
    communication: 75,
    motivation: 75,
    punctuality: 75,
    professionalism: 75,
    feedback: "",
    customerName: "",
    customerEmail: "",
  });

  const filteredTrainers = MOCK_TRAINERS.filter(trainer =>
    (trainer.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trainer.specialization ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTrainerSelect = (trainer: TrainerProfile) => {
    setSelectedTrainer(trainer);
    setFeedbackForm(prev => ({
      ...prev,
      trainerId: trainer.id,
      trainerName: trainer.name,
    }));
    setActiveTab("feedback");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...files].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeFeedback = async () => {
    if (!feedbackForm.feedback && uploadedFiles.length === 0) {
      toast({
        title: "No content to analyze",
        description: "Please enter feedback or upload files first.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-sentiment', {
        body: {
          title: `Trainer Feedback - ${feedbackForm.trainerName}`,
          description: feedbackForm.feedback,
          feedback: feedbackForm.feedback,
          trainerName: feedbackForm.trainerName,
        },
      });

      if (error) throw error;

      setAiInsights(data);
      toast({
        title: "Analysis complete",
        description: "AI insights have been generated.",
      });
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis failed",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!selectedTrainer) {
      toast({
        title: "Select a trainer",
        description: "Please select a trainer first.",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real app, this would save to the database
      toast({
        title: "Feedback submitted",
        description: `Feedback for ${selectedTrainer.name} has been recorded.`,
      });
      
      // Reset form
      setSelectedTrainer(null);
      setFeedbackForm({
        trainerId: "",
        trainerName: "",
        classType: "",
        classDate: "",
        overallRating: 4,
        technique: 75,
        communication: 75,
        motivation: 75,
        punctuality: 75,
        professionalism: 75,
        feedback: "",
        customerName: "",
        customerEmail: "",
      });
      setAiInsights(null);
      setUploadedFiles([]);
      setActiveTab("trainers");
    } catch (error: any) {
      toast({
        title: "Error submitting feedback",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const TrendIcon = ({ trend }: { trend: "up" | "down" | "stable" }) => {
    if (trend === "up") return <TrendingUp className="h-4 w-4 text-emerald-500" />;
    if (trend === "down") return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
              <Star className="h-5 w-5 text-white" />
            </div>
            Trainer Feedback & Evaluation
          </DialogTitle>
          <DialogDescription>
            Submit feedback, view trainer profiles, and get AI-powered insights
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="trainers" className="gap-2">
                <User className="h-4 w-4" />
                Trainers
              </TabsTrigger>
              <TabsTrigger value="feedback" className="gap-2" disabled={!selectedTrainer}>
                <MessageSquare className="h-4 w-4" />
                Submit Feedback
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                Import Data
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="overflow-y-auto max-h-[calc(90vh-200px)] px-6 pb-6">
            {/* Trainers Tab */}
            <TabsContent value="trainers" className="m-0 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search trainers by name or specialization..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {filteredTrainers.map((trainer, index) => (
                    <motion.div
                      key={trainer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={cn(
                          "glass-card cursor-pointer transition-all hover:shadow-xl",
                          selectedTrainer?.id === trainer.id && "ring-2 ring-primary"
                        )}
                        onClick={() => handleTrainerSelect(trainer)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-14 w-14 ring-2 ring-primary/20">
                              <AvatarImage src={trainer.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white font-semibold">
                                {(trainer.name ?? '').split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">{trainer.name}</h3>
                                <TrendIcon trend={trainer.trend} />
                              </div>
                              <p className="text-sm text-muted-foreground">{trainer.specialization}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                                  <span className="font-semibold">{trainer.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  ({trainer.totalFeedback} reviews)
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Score Bars */}
                          <div className="mt-4 space-y-2">
                            {Object.entries(trainer.scores).slice(0, 3).map(([key, value]) => (
                              <div key={key} className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="capitalize text-muted-foreground">{key}</span>
                                  <span className="font-medium">{value}%</span>
                                </div>
                                <Progress value={value} className="h-1.5" />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback" className="m-0 space-y-6">
              {selectedTrainer && (
                <>
                  {/* Selected Trainer Card */}
                  <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
                    <CardContent className="p-4 flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white">
                          {(selectedTrainer.name ?? '').split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{selectedTrainer.name}</h3>
                        <p className="text-sm text-muted-foreground">{selectedTrainer.specialization}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => setActiveTab("trainers")}
                      >
                        Change
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Feedback Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Class Type</Label>
                        <Select
                          value={feedbackForm.classType}
                          onValueChange={(value) => setFeedbackForm(prev => ({ ...prev, classType: value }))}
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select class type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="barre">Barre</SelectItem>
                            <SelectItem value="pilates">Pilates</SelectItem>
                            <SelectItem value="yoga">Yoga</SelectItem>
                            <SelectItem value="hiit">HIIT</SelectItem>
                            <SelectItem value="strength">Strength</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Class Date</Label>
                        <Input
                          type="date"
                          value={feedbackForm.classDate}
                          onChange={(e) => setFeedbackForm(prev => ({ ...prev, classDate: e.target.value }))}
                          className="rounded-xl"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Overall Rating</Label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setFeedbackForm(prev => ({ ...prev, overallRating: star }))}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={cn(
                                  "h-8 w-8",
                                  star <= feedbackForm.overallRating
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-muted-foreground"
                                )}
                              />
                            </button>
                          ))}
                          <span className="ml-2 font-semibold">{feedbackForm.overallRating}/5</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {SCORE_CATEGORIES.map((cat) => {
                        const Icon = cat.icon;
                        const value = feedbackForm[cat.key as keyof FeedbackFormData] as number;
                        return (
                          <div key={cat.key} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="flex items-center gap-2">
                                <Icon className="h-4 w-4 text-muted-foreground" />
                                {cat.label}
                              </Label>
                              <span className="text-sm font-medium">{value}%</span>
                            </div>
                            <Slider
                              value={[value]}
                              onValueChange={([v]) => setFeedbackForm(prev => ({ ...prev, [cat.key]: v }))}
                              max={100}
                              step={5}
                              className="w-full"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Written Feedback</Label>
                    <Textarea
                      placeholder="Share your detailed feedback about the class and instructor..."
                      value={feedbackForm.feedback}
                      onChange={(e) => setFeedbackForm(prev => ({ ...prev, feedback: e.target.value }))}
                      className="rounded-xl min-h-32"
                    />
                  </div>

                  {/* AI Analysis */}
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={analyzeFeedback}
                      disabled={isAnalyzing || !feedbackForm.feedback}
                      className="rounded-xl"
                    >
                      {isAnalyzing ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      Analyze with AI
                    </Button>
                  </div>

                  {aiInsights && (
                    <Card className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-violet-500" />
                          AI Insights
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-4">
                          <Badge variant={
                            aiInsights.sentiment === "positive" ? "default" :
                            aiInsights.sentiment === "negative" ? "destructive" : "secondary"
                          }>
                            {aiInsights.sentiment}
                          </Badge>
                          <span className="text-sm">Score: <strong>{aiInsights.score}/100</strong></span>
                        </div>
                        {aiInsights.tags && (
                          <div className="flex flex-wrap gap-2">
                            {aiInsights.tags.map((tag: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        )}
                        {aiInsights.insights && (
                          <p className="text-sm text-muted-foreground">{aiInsights.insights}</p>
                        )}
                        {aiInsights.strengths && (
                          <div>
                            <p className="text-xs font-medium text-emerald-600 mb-1">Strengths:</p>
                            <p className="text-sm">{aiInsights.strengths}</p>
                          </div>
                        )}
                        {aiInsights.improvements && (
                          <div>
                            <p className="text-xs font-medium text-amber-600 mb-1">Areas for Improvement:</p>
                            <p className="text-sm">{aiInsights.improvements}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">
                      Cancel
                    </Button>
                    <Button onClick={handleSubmitFeedback} className="rounded-xl">
                      Submit Feedback
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="m-0 space-y-6">
              <Card className="border-dashed border-2 border-muted-foreground/25">
                <CardContent className="py-12">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".csv,.pdf,.xlsx,.xls,.doc,.docx"
                    multiple
                    className="hidden"
                  />
                  <div className="text-center">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="font-semibold mb-2">Upload Feedback Documents</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Upload CSV, PDF, Excel, or Word documents containing past feedback data
                    </p>
                    <Button onClick={() => fileInputRef.current?.click()} className="rounded-xl">
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Uploaded Files ({uploadedFiles.length}/5)</h4>
                  {uploadedFiles.map((file, index) => (
                    <Card key={index} className="glass-card">
                      <CardContent className="p-3 flex items-center gap-3">
                        <FileText className="h-8 w-8 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                          className="shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    onClick={analyzeFeedback}
                    disabled={isAnalyzing}
                    className="w-full rounded-xl"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Process & Analyze Files with AI
                  </Button>
                </div>
              )}

              <Card className="bg-muted/50">
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Supported Formats</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">.csv</Badge>
                      <span>Spreadsheet data</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">.pdf</Badge>
                      <span>Documents</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">.xlsx</Badge>
                      <span>Excel files</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">.docx</Badge>
                      <span>Word documents</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
