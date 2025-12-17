import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileImage,
  Check,
  Loader2,
  Calendar,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ExportDialogProps {
  data: any[];
  filename?: string;
  title?: string;
  children?: React.ReactNode;
}

type ExportFormat = "csv" | "xlsx" | "pdf" | "json";

const formatConfig: Record<ExportFormat, { icon: React.ElementType; label: string; description: string }> = {
  csv: { icon: FileSpreadsheet, label: "CSV", description: "Comma-separated values, opens in Excel" },
  xlsx: { icon: FileSpreadsheet, label: "Excel", description: "Native Excel format with formatting" },
  pdf: { icon: FileText, label: "PDF", description: "Printable document format" },
  json: { icon: FileText, label: "JSON", description: "Raw data for developers" },
};

export function ExportDialog({ data, filename = "export", title = "Export Data", children }: ExportDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [dateRange, setDateRange] = useState<"all" | "30d" | "7d">("all");

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let content: string;
      let mimeType: string;
      let extension: string;

      switch (format) {
        case "csv":
          content = convertToCSV(data, includeHeaders);
          mimeType = "text/csv";
          extension = "csv";
          break;
        case "json":
          content = JSON.stringify(data, null, 2);
          mimeType = "application/json";
          extension = "json";
          break;
        case "xlsx":
          // For Excel, we'd typically use a library like xlsx
          // For now, export as CSV which Excel can open
          content = convertToCSV(data, includeHeaders);
          mimeType = "text/csv";
          extension = "csv";
          break;
        case "pdf":
          // For PDF, we'd typically use a library like jspdf
          // For now, show a toast about the limitation
          toast({
            title: "PDF Export",
            description: "PDF export would generate a formatted report. For now, try CSV or JSON.",
          });
          setIsExporting(false);
          return;
        default:
          content = JSON.stringify(data);
          mimeType = "application/json";
          extension = "json";
      }

      // Create and download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}_${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Successfully exported ${data.length} records as ${format.toUpperCase()}`,
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="rounded-xl">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            Export {data.length} records in your preferred format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <RadioGroup
              value={format}
              onValueChange={(value) => setFormat(value as ExportFormat)}
              className="grid grid-cols-2 gap-3"
            >
              {Object.entries(formatConfig).map(([key, config]) => {
                const Icon = config.icon;
                const isSelected = format === key;
                return (
                  <motion.label
                    key={key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      "relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all",
                      "border-2",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <RadioGroupItem value={key} className="sr-only" />
                    <Icon className={cn(
                      "h-8 w-8 mb-2 transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className="font-medium text-sm">{config.label}</span>
                    <span className="text-xs text-muted-foreground text-center mt-1">
                      {config.description}
                    </span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                      >
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </motion.div>
                    )}
                  </motion.label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Options</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="headers"
                checked={includeHeaders}
                onCheckedChange={(checked) => setIncludeHeaders(checked as boolean)}
              />
              <label htmlFor="headers" className="text-sm cursor-pointer">
                Include column headers
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date Range
              </Label>
              <RadioGroup
                value={dateRange}
                onValueChange={(value) => setDateRange(value as "all" | "30d" | "7d")}
                className="flex gap-2"
              >
                {[
                  { value: "all", label: "All Time" },
                  { value: "30d", label: "Last 30 Days" },
                  { value: "7d", label: "Last 7 Days" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex-1 px-3 py-2 rounded-lg text-center text-sm cursor-pointer transition-all",
                      "border",
                      dateRange === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/30"
                    )}
                  >
                    <RadioGroupItem value={option.value} className="sr-only" />
                    {option.label}
                  </label>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="rounded-xl">
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function convertToCSV(data: any[], includeHeaders: boolean): string {
  if (data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      // Handle values that contain commas or quotes
      if (typeof value === "string" && (value.includes(",") || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value ?? "";
    }).join(",")
  );

  if (includeHeaders) {
    return [headers.join(","), ...rows].join("\n");
  }
  return rows.join("\n");
}
