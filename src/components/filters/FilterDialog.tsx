/**
 * Filter Dialog Component
 * 
 * Dialog-based filter selector with search and confirmation
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterDialogProps {
  title: string;
  description?: string;
  options: FilterOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  maxSelections?: number;
  isLoading?: boolean;
}

export function FilterDialog({
  title,
  description,
  options,
  selected,
  onChange,
  maxSelections = Infinity,
  isLoading = false,
}: FilterDialogProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(selected);

  // Filter options based on search term
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle checkbox toggle
  const handleToggle = (value: string) => {
    const newSelected = tempSelected.includes(value)
      ? tempSelected.filter((v) => v !== value)
      : tempSelected.length < maxSelections
      ? [...tempSelected, value]
      : tempSelected;
    setTempSelected(newSelected);
  };

  // Handle confirm
  const handleConfirm = () => {
    onChange(tempSelected);
    setOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    setTempSelected(selected);
    setSearchTerm('');
    setOpen(false);
  };

  // Handle open change
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setTempSelected(selected);
      setSearchTerm('');
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {selected.length > 0 ? `${selected.length} selected` : `Select ${title.toLowerCase()}...`}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Selection Count */}
          <div className="text-sm text-muted-foreground">
            {tempSelected.length} / {maxSelections === Infinity ? '∞' : maxSelections} selected
            {tempSelected.length >= maxSelections && maxSelections !== Infinity && (
              <span className="text-amber-600"> (max reached)</span>
            )}
          </div>

          {/* Options List */}
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : filteredOptions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No options found</div>
              ) : (
                filteredOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={tempSelected.includes(option.value)}
                      onCheckedChange={() => handleToggle(option.value)}
                      disabled={
                        !tempSelected.includes(option.value) &&
                        tempSelected.length >= maxSelections
                      }
                    />
                    <Label
                      htmlFor={option.value}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
