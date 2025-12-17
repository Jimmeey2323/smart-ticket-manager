import { useState, useMemo, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Upload,
  X,
  AlertCircle,
  Calendar,
  Clock,
  Plus,
  User,
  MapPin,
  FileText,
  Paperclip,
  Sparkles,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  Zap,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { MomenceClientSearch } from "@/components/momence-client-search";
import { MomenceSessionSelector } from "@/components/momence-session-selector";
import { TicketTemplates, type TicketTemplate } from "@/components/ticket-templates";
import { TicketTemplates, type TicketTemplate } from "@/components/ticket-templates";
import { supabase } from "@/integrations/supabase/client";
import { PRIORITIES, CLIENT_MOODS, CLIENT_STATUSES, TRAINERS, CLASSES } from "@/lib/constants";
import { cn } from "@/lib/utils";

// Types from Supabase
interface Category {
  id: string;
  name: string;
  code: string;
  icon: string | null;
  color: string | null;
  defaultPriority: string | null;
  slaHours: number | null;
}

interface Subcategory {
  id: string;
  name: string;
  code: string;
  categoryId: string;
  defaultPriority: string | null;
}

interface DynamicField {
  id: string;
  uniqueId: string;
  label: string;
  fieldTypeId: string;
  categoryId: string | null;
  subcategoryId: string | null;
  isRequired: boolean | null;
  isHidden: boolean | null;
  options: string[] | null;
  defaultValue: string | null;
  sortOrder: number | null;
  fieldType?: {
    name: string;
    inputComponent: string;
  };
}

interface Studio {
  id: string;
  name: string;
  code: string;
  address: any;
}

const ticketFormSchema = z.object({
  studioId: z.string().min(1, "Please select a studio"),
  categoryId: z.string().min(1, "Please select a category"),
  subcategoryId: z.string().optional(),
  priority: z.string().default("medium"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional().or(z.literal("")),
  customerPhone: z.string().optional(),
  customerMembershipId: z.string().optional(),
  customerStatus: z.string().optional(),
  clientMood: z.string().optional(),
  incidentDateTime: z.string().optional(),
  trainer: z.string().optional(),
  className: z.string().optional(),
  source: z.string().optional(),
}).passthrough();

type TicketFormValues = z.infer<typeof ticketFormSchema>;

const steps = [
  { id: 1, name: "Template", description: "Choose a starting point" },
  { id: 2, name: "Details", description: "Issue information" },
  { id: 3, name: "Context", description: "Location & customer" },
  { id: 4, name: "Review", description: "Confirm & submit" },
];

export default function NewTicket() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [creationMode, setCreationMode] = useState<"template" | "manual">("template");
  const [selectedTemplate, setSelectedTemplate] = useState<TicketTemplate | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [showClientBlock, setShowClientBlock] = useState(false);
  const [showSessionBlock, setShowSessionBlock] = useState(false);
  const [ticketNumber, setTicketNumber] = useState("");
  const [selectedMomenceClient, setSelectedMomenceClient] = useState<any>(null);
  const [selectedMomenceSession, setSelectedMomenceSession] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const generateTicketNumber = () => {
      const now = new Date();
      const year = now.getFullYear().toString().slice(-2);
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      return `TKT-${year}${month}${day}-${random}`;
    };
    setTicketNumber(generateTicketNumber());
  }, []);

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      studioId: "",
      categoryId: "",
      subcategoryId: "",
      priority: "medium",
      title: "",
      description: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerMembershipId: "",
      customerStatus: "",
      clientMood: "",
      incidentDateTime: new Date().toISOString().slice(0, 16),
      trainer: "",
      className: "",
    },
  });

  const selectedCategoryId = form.watch("categoryId");
  const selectedSubcategoryId = form.watch("subcategoryId");

  // Fetch categories from Supabase
  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('isActive', true)
        .order('sortOrder')
        .order('name');
      
      if (error) throw error;
      return data as Category[];
    },
  });

  // Fetch subcategories based on selected category
  const { data: subcategories = [], isLoading: subcategoriesLoading } = useQuery({
    queryKey: ['subcategories', selectedCategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      
      const { data, error } = await supabase
        .from('subcategories')
        .select('*')
        .eq('categoryId', selectedCategoryId)
        .eq('isActive', true)
        .order('sortOrder')
        .order('name');
      
      if (error) throw error;
      return data as Subcategory[];
    },
    enabled: !!selectedCategoryId,
  });

  // Fetch dynamic fields based on selected subcategory (or category if no subcategory)
  const { data: dynamicFields = [], isLoading: fieldsLoading } = useQuery({
    queryKey: ['dynamicFields', selectedCategoryId, selectedSubcategoryId],
    queryFn: async () => {
      if (!selectedCategoryId) return [];
      
      let query = supabase
        .from('dynamicFields')
        .select(`
          *,
          fieldType:fieldTypes(name, inputComponent)
        `)
        .eq('isActive', true)
        .eq('isHidden', false);
      
      // If subcategory is selected, filter by it
      if (selectedSubcategoryId) {
        query = query.eq('subcategoryId', selectedSubcategoryId);
      } else {
        // If no subcategory, get category-level fields (those with null subcategoryId)
        query = query.eq('categoryId', selectedCategoryId).is('subcategoryId', null);
      }
      
      const { data, error } = await query.order('sortOrder');
      
      if (error) throw error;
      return data as DynamicField[];
    },
    enabled: !!selectedCategoryId,
  });

  // Fetch studios from Supabase
  const { data: studios = [], isLoading: studiosLoading } = useQuery({
    queryKey: ['studios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .eq('isActive', true)
        .order('name');
      
      if (error) throw error;
      return data as Studio[];
    },
  });

  // Reset subcategory when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      form.setValue('subcategoryId', '');
      // Set default priority from category
      const category = categories.find(c => c.id === selectedCategoryId);
      if (category?.defaultPriority) {
        form.setValue('priority', category.defaultPriority);
      }
    }
  }, [selectedCategoryId, categories, form]);

  const onSubmit = async (data: TicketFormValues) => {
    try {
      setIsSubmitting(true);

      // Build dynamic field data
      const dynamicFieldData: Record<string, any> = {};
      dynamicFields.forEach((field) => {
        const value = (data as any)[field.uniqueId];
        if (value !== undefined && value !== "") {
          dynamicFieldData[field.uniqueId] = value;
        }
      });
      if (data.trainer) dynamicFieldData.trainer = data.trainer;
      if (data.className) dynamicFieldData.className = data.className;

      // Get category and subcategory names for AI routing
      const category = categories.find(c => c.id === data.categoryId);
      const subcategory = subcategories.find(s => s.id === data.subcategoryId);

      // AI-powered routing analysis
      let aiRouting = null;
      try {
        const { data: routingData, error: routingError } = await supabase.functions.invoke('analyze-ticket', {
          body: {
            title: data.title,
            description: data.description,
            category: category?.name,
            subcategory: subcategory?.name,
            studioId: data.studioId,
          }
        });
        if (!routingError && routingData) {
          aiRouting = routingData;
          // Update priority if AI suggests higher priority
          const priorityOrder = ['low', 'medium', 'high', 'critical'];
          if (aiRouting.priority && priorityOrder.indexOf(aiRouting.priority) > priorityOrder.indexOf(data.priority)) {
            data.priority = aiRouting.priority;
          }
        }
      } catch (aiError) {
        console.warn('AI routing failed, using manual assignment:', aiError);
      }

      const ticketData = {
        ticketNumber,
        studioId: data.studioId,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId || null,
        priority: data.priority,
        title: data.title,
        description: data.description,
        customerName: data.customerName || null,
        customerEmail: data.customerEmail || null,
        customerPhone: data.customerPhone || null,
        customerMembershipId: data.customerMembershipId || null,
        customerStatus: data.customerStatus || null,
        clientMood: data.clientMood || null,
        incidentDateTime: data.incidentDateTime ? new Date(data.incidentDateTime).toISOString() : null,
        dynamicFieldData: {
          ...dynamicFieldData,
          aiRouting: aiRouting ? {
            department: aiRouting.department,
            suggestedTags: aiRouting.suggestedTags,
            needsEscalation: aiRouting.needsEscalation,
            routingConfidence: aiRouting.routingConfidence,
            analysis: aiRouting.analysis,
          } : null,
        },
        source: data.source || 'in-person',
        status: aiRouting?.needsEscalation ? 'escalated' : 'new',
        tags: aiRouting?.suggestedTags || [],
      };

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single();

      if (error) throw error;

      // Send notification if ticket needs escalation
      if (aiRouting?.needsEscalation) {
        try {
          await supabase.functions.invoke('send-ticket-notification', {
            body: {
              type: 'escalation',
              ticketNumber,
              ticketTitle: data.title,
              recipientEmail: 'jimmeey@physique57india.com',
              recipientName: 'Manager',
              priority: data.priority,
              category: category?.name,
              escalationReason: aiRouting.escalationReason || 'High priority ticket requiring immediate attention',
            }
          });
        } catch (notifError) {
          console.warn('Notification failed:', notifError);
        }
      }

      toast({
        title: "Ticket created successfully",
        description: aiRouting 
          ? `Ticket ${ticketNumber} submitted. AI routed to ${aiRouting.department} department.`
          : `Ticket ${ticketNumber} has been submitted.`,
      });

      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      navigate("/tickets");
    } catch (error: any) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error creating ticket",
        description: error.message || "Failed to create ticket",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: TicketTemplate) => {
    setSelectedTemplate(template);
    // Find category by name
    const category = categories.find(c => c.name === template.category);
    if (category) {
      form.setValue("categoryId", category.id);
    }
    form.setValue("priority", template.priority);
    form.setValue("title", template.suggestedTitle);
    form.setValue("description", template.suggestedDescription);
  };

  const handleMomenceClientSelect = (client: any) => {
    setSelectedMomenceClient(client);
    if (client) {
      form.setValue("customerName", `${client.firstName || ''} ${client.lastName || ''}`.trim());
      form.setValue("customerEmail", client.email || "");
      form.setValue("customerPhone", client.phoneNumber || "");
      form.setValue("customerMembershipId", client.id ? String(client.id) : "");
      form.setValue("source", "momence");
    } else {
      form.setValue("customerName", "");
      form.setValue("customerEmail", "");
      form.setValue("customerPhone", "");
      form.setValue("customerMembershipId", "");
    }
  };

  const handleMomenceSessionSelect = (session: any) => {
    setSelectedMomenceSession(session);
    if (session) {
      form.setValue("className", session.name || "");
      if (session.teacher) {
        form.setValue("trainer", `${session.teacher.firstName} ${session.teacher.lastName}`.trim());
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles].slice(0, 5));
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const progress = (currentStep / 4) * 100;

  // Render dynamic field based on field type
  const renderDynamicField = (field: DynamicField) => {
    const fieldTypeName = field.fieldType?.name || '';
    const inputComponent = field.fieldType?.inputComponent || 'Input';
    const fieldLabel = field.label || 'Field';

    return (
      <FormField
        key={field.uniqueId}
        control={form.control}
        name={field.uniqueId as any}
        render={({ field: formField }) => (
          <FormItem>
            <FormLabel>
              {fieldLabel}
              {field.isRequired && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
            <FormControl>
              {inputComponent === 'Select' || fieldTypeName === 'Dropdown' ? (
                <Select
                  onValueChange={formField.onChange}
                  value={(formField.value as string) || ''}
                >
                  <SelectTrigger className="rounded-xl bg-background">
                    <SelectValue placeholder={`Select ${fieldLabel.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {field.options?.map((opt, idx) => (
                      <SelectItem key={idx} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : inputComponent === 'Textarea' || fieldTypeName === 'Long Text' ? (
                <Textarea
                  placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                  value={(formField.value as string) || ''}
                  onChange={formField.onChange}
                  className="rounded-xl"
                />
              ) : inputComponent === 'Checkbox' || fieldTypeName === 'Checkbox' ? (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formField.value === 'Yes' || formField.value === true}
                    onCheckedChange={(checked) => formField.onChange(checked ? 'Yes' : 'No')}
                  />
                  <span className="text-sm text-muted-foreground">Yes</span>
                </div>
              ) : (
                <Input
                  type={fieldTypeName === 'Email' ? 'email' : fieldTypeName === 'Phone' ? 'tel' : 'text'}
                  placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                  value={(formField.value as string) || ''}
                  onChange={formField.onChange}
                  className="rounded-xl"
                />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/tickets")}
            className="rounded-xl hover:bg-primary/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text-accent">Create New Ticket</h1>
                <p className="text-sm text-muted-foreground">
                  Log and track customer feedback efficiently
                </p>
              </div>
            </div>
          </div>
          <Badge variant="outline" className="font-mono text-sm">
            {ticketNumber}
          </Badge>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <motion.div
                        initial={false}
                        animate={{
                          scale: currentStep === step.id ? 1.1 : 1,
                          backgroundColor: currentStep >= step.id 
                            ? "hsl(var(--primary))" 
                            : "hsl(var(--muted))",
                        }}
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                          currentStep >= step.id 
                            ? "text-primary-foreground" 
                            : "text-muted-foreground"
                        )}
                      >
                        {currentStep > step.id ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          step.id
                        )}
                      </motion.div>
                      <span className={cn(
                        "text-xs mt-2 font-medium hidden sm:block",
                        currentStep >= step.id ? "text-primary" : "text-muted-foreground"
                      )}>
                        {step.name}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={cn(
                        "h-0.5 w-12 sm:w-24 mx-2",
                        currentStep > step.id ? "bg-primary" : "bg-muted"
                      )} />
                    )}
                  </div>
                ))}
              </div>
              <Progress value={progress} className="h-1" />
            </CardContent>
          </Card>
        </motion.div>

        {/* Form Content */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Step 1: Template Selection */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="glass-card">
                    <CardContent className="p-6">
                      <Tabs value={creationMode} onValueChange={(v) => setCreationMode(v as "template" | "manual")}>
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                          <TabsTrigger value="template" className="gap-2">
                            <Sparkles className="h-4 w-4" />
                            Use Template
                          </TabsTrigger>
                          <TabsTrigger value="manual" className="gap-2">
                            <FileText className="h-4 w-4" />
                            Start Fresh
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="template">
                          <TicketTemplates 
                            onSelectTemplate={handleTemplateSelect}
                            selectedTemplateId={selectedTemplate?.id}
                          />
                        </TabsContent>

                        <TabsContent value="manual">
                          <div className="text-center py-12">
                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              <FileText className="h-8 w-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">Start from scratch</h3>
                            <p className="text-muted-foreground text-sm mb-6">
                              Create a custom ticket without using a template
                            </p>
                            <Button onClick={nextStep} className="rounded-xl">
                              Continue to Details
                              <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Issue Details */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-primary" />
                        Issue Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Category Selection */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="categoryId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-xl bg-background">
                                    <SelectValue placeholder={categoriesLoading ? "Loading..." : "Select category"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-popover border border-border z-50">
                                  {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                      <span className="flex items-center gap-2">
                                        <span 
                                          className="w-2 h-2 rounded-full" 
                                          style={{ backgroundColor: cat.color || '#3B82F6' }}
                                        />
                                        {cat.name}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Subcategory Selection - only show if category is selected and has subcategories */}
                        {selectedCategoryId && (
                          <FormField
                            control={form.control}
                            name="subcategoryId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subcategory</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-xl bg-background">
                                      <SelectValue placeholder={subcategoriesLoading ? "Loading..." : subcategories.length === 0 ? "No subcategories" : "Select subcategory"} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-popover border border-border z-50">
                                    {subcategories.map((sub) => (
                                      <SelectItem key={sub.id} value={sub.id}>
                                        {sub.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>

                      {/* Priority Selection */}
                      <FormField
                        control={form.control}
                        name="priority"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Priority Level</FormLabel>
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                value={field.value}
                                className="grid grid-cols-2 md:grid-cols-4 gap-3"
                              >
                                {Object.entries(PRIORITIES).map(([value, config]) => (
                                  <label
                                    key={value}
                                    className={cn(
                                      "flex items-center justify-center p-3 rounded-xl cursor-pointer transition-all border-2",
                                      field.value === value
                                        ? "border-primary bg-primary/10"
                                        : "border-border hover:border-primary/30"
                                    )}
                                  >
                                    <RadioGroupItem value={value} className="sr-only" />
                                    <span className={cn(
                                      "text-sm font-medium",
                                      field.value === value ? "text-primary" : "text-muted-foreground"
                                    )}>
                                      {config.label}
                                    </span>
                                  </label>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Title */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Issue Title *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Brief summary of the issue"
                                className="rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Description */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Provide detailed information about the issue..."
                                className="min-h-32 rounded-xl"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Dynamic Fields based on subcategory */}
                      {dynamicFields.length > 0 && (
                        <div className="border-t pt-6">
                          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Zap className="h-4 w-4 text-primary" />
                            Additional Information
                            {fieldsLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {dynamicFields.map(renderDynamicField)}
                          </div>
                        </div>
                      )}

                      {/* Trainer and Class fields - only show if session block is not used */}
                      {!showSessionBlock && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="trainer"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trainer/Instructor</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-xl bg-background">
                                      <SelectValue placeholder="Select trainer (if applicable)" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-popover border border-border z-50 max-h-60">
                                    {TRAINERS.map((trainer) => (
                                      <SelectItem key={trainer} value={trainer}>
                                        {trainer}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="className"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Class Name</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger className="rounded-xl bg-background">
                                      <SelectValue placeholder="Select class (if applicable)" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-popover border border-border z-50 max-h-60">
                                    {CLASSES.map((cls) => (
                                      <SelectItem key={cls} value={cls}>
                                        {cls}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 3: Context - Studio & Customer */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        Location & Context
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="studioId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Studio Location *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger className="rounded-xl bg-background">
                                    <SelectValue placeholder={studiosLoading ? "Loading..." : "Select studio"} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-popover border border-border z-50">
                                  {studios.map((studio) => (
                                    <SelectItem key={studio.id} value={studio.id}>
                                      {studio.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="incidentDateTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Incident Date & Time</FormLabel>
                              <FormControl>
                                <Input
                                  type="datetime-local"
                                  className="rounded-xl"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Client Information (Optional) */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <User className="h-4 w-4 text-primary" />
                            Client Information
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowClientBlock(!showClientBlock)}
                            className="rounded-lg"
                          >
                            {showClientBlock ? "Hide" : "Add Client Details"}
                          </Button>
                        </div>

                        {showClientBlock && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <MomenceClientSearch 
                              onClientSelect={handleMomenceClientSelect}
                              selectedClient={selectedMomenceClient}
                            />

                            {/* Only show mood/status if client is selected */}
                            {selectedMomenceClient && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                <FormField
                                  control={form.control}
                                  name="customerStatus"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Customer Status</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="rounded-xl bg-background">
                                            <SelectValue placeholder="Select status" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-popover border border-border z-50">
                                          {CLIENT_STATUSES.map((status) => (
                                            <SelectItem key={status.value} value={status.value}>
                                              {status.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <FormField
                                  control={form.control}
                                  name="clientMood"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Client Mood</FormLabel>
                                      <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                          <SelectTrigger className="rounded-xl bg-background">
                                            <SelectValue placeholder="How was the client feeling?" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-popover border border-border z-50">
                                          {CLIENT_MOODS.map((mood) => (
                                            <SelectItem key={mood.value} value={mood.value}>
                                              {mood.label}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </motion.div>
                        )}
                      </div>

                      {/* Session/Class Information (Optional) */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-semibold flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            Class/Session Details
                            <Badge variant="outline" className="text-xs">Optional</Badge>
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowSessionBlock(!showSessionBlock)}
                            className="rounded-lg"
                          >
                            {showSessionBlock ? "Hide" : "Add Session Details"}
                          </Button>
                        </div>

                        {showSessionBlock && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <MomenceSessionSelector
                              onSessionSelect={handleMomenceSessionSelect}
                              selectedSession={selectedMomenceSession}
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* File Attachments */}
                      <div className="border-t pt-6">
                        <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-primary" />
                          Attachments
                        </h4>
                        <div className="border-2 border-dashed border-border rounded-xl p-6 text-center">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-upload"
                            accept="image/*,.pdf,.doc,.docx"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Click to upload or drag files here
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Max 5 files (Images, PDF, DOC)
                            </span>
                          </label>
                        </div>
                        {attachedFiles.length > 0 && (
                          <div className="mt-4 space-y-2">
                            {attachedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <span className="text-sm truncate">{file.name}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeFile(index)}
                                  className="h-8 w-8"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        Review & Submit
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Category</span>
                            <p className="font-medium">
                              {categories.find(c => c.id === form.watch("categoryId"))?.name || "Not selected"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Subcategory</span>
                            <p className="font-medium">
                              {subcategories.find(s => s.id === form.watch("subcategoryId"))?.name || "None"}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Priority</span>
                            <p className="font-medium capitalize">{form.watch("priority")}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Studio</span>
                            <p className="font-medium">
                              {studios.find(s => s.id === form.watch("studioId"))?.name || "Not selected"}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <span className="text-sm text-muted-foreground">Title</span>
                            <p className="font-medium">{form.watch("title") || "Not provided"}</p>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">Description</span>
                            <p className="font-medium text-sm line-clamp-3">
                              {form.watch("description") || "Not provided"}
                            </p>
                          </div>
                          {form.watch("customerName") && (
                            <div>
                              <span className="text-sm text-muted-foreground">Customer</span>
                              <p className="font-medium">{form.watch("customerName")}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Dynamic fields summary */}
                      {dynamicFields.length > 0 && (
                        <div className="border-t pt-4">
                          <h4 className="text-sm font-semibold mb-3">Additional Details</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {dynamicFields.map((field) => {
                              const value = form.watch(field.uniqueId as any);
                              if (!value) return null;
                              return (
                                <div key={field.uniqueId}>
                                  <span className="text-xs text-muted-foreground">{field.label}</span>
                                  <p className="text-sm font-medium">{String(value)}</p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="rounded-xl"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="rounded-xl"
                  disabled={currentStep === 1 && creationMode === "template" && !selectedTemplate}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Create Ticket
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
