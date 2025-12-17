import { useState } from "react";
import {
  Search,
  FolderKanban,
  ChevronRight,
  Plus,
  Edit2,
  Trash2,
  MoreVertical,
  Users,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "@/components/priority-badge";
import { CATEGORIES, PRIORITIES } from "@/lib/constants";

export default function Categories() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );

  const filteredCategories = CATEGORIES.filter(
    (cat) =>
      (cat.name ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.subcategories.some((sub) =>
        (sub ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const toggleCategory = (id: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    setExpandedCategories(new Set(CATEGORIES.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage ticket categories and subcategories
          </p>
        </div>
        <Button data-testid="button-add-category">
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories or subcategories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-testid="input-search-categories"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredCategories.map((category) => (
          <Collapsible
            key={category.id}
            open={expandedCategories.has(category.id)}
            onOpenChange={() => toggleCategory(category.id)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="py-4 cursor-pointer hover-elevate rounded-t-md">
                  <div className="flex items-center gap-4">
                    <ChevronRight
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        expandedCategories.has(category.id) ? "rotate-90" : ""
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="font-medium">{category.name}</h3>
                        <PriorityBadge
                          priority={
                            category.defaultPriority as keyof typeof PRIORITIES
                          }
                        />
                        <Badge variant="secondary" className="text-xs">
                          {category.subcategories.length} subcategories
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {category.defaultTeam}
                        </span>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => e.stopPropagation()}
                          data-testid={`button-category-menu-${category.id}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Category
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Subcategory
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 pt-2 border-t">
                    {category.subcategories.map((sub, index) => (
                      <div
                        key={sub}
                        className="flex items-center justify-between p-2 rounded-md hover-elevate group"
                      >
                        <span className="text-sm">{sub}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="invisible group-hover:visible h-7 w-7"
                          data-testid={`button-subcategory-edit-${index}`}
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">Category Configuration</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Categories and subcategories determine how tickets are
                classified and routed. Each category can have a default team
                assignment and priority level. Subcategories can override these
                defaults for more granular control.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
