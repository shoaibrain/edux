"use client";

import * as React from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Command as CommandPrimitive } from "cmdk";

type Option = Record<"value" | "label", string>;

// Add onValueChange to the props
interface MultiSelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
    options: Option[];
    defaultValue?: string[];
    onValueChange?: (value: string[]) => void;
}

export function MultiSelect({ options, name, defaultValue = [], onValueChange, ...props }: MultiSelectProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Option[]>(() => {
    return options.filter(option => defaultValue.includes(option.value));
  });
  const [inputValue, setInputValue] = React.useState("");

  // Propagate changes up to the form
  React.useEffect(() => {
    onValueChange?.(selected.map(s => s.value));
  }, [selected, onValueChange]);

  const handleUnselect = React.useCallback((option: Option) => {
    setSelected(prev => prev.filter(s => s.value !== option.value));
  }, []);

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current
    if (input) {
      if ((e.key === "Delete" || e.key === "Backspace") && input.value === "") {
        setSelected(prev => {
            const newSelected = [...prev];
            newSelected.pop();
            return newSelected;
        })
      }
      if (e.key === "Escape") {
        input.blur();
      }
    }
  }, []);

  const selectables = options.filter(option => !selected.some(s => s.value === option.value));
  const { value, ...restProps } = props;

  return (
      <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
        <div
          className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
        >
          <div className="flex gap-1 flex-wrap">
            {selected.map((option) => {
              return (
                <Badge key={option.value} variant="secondary">
                  {option.label}
                  <button
                    type="button"
                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => handleUnselect(option)}
                  >
                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              )
            })}
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              onValueChange={setInputValue}
              onBlur={() => setOpen(false)}
              onFocus={() => setOpen(true)}
              className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
              {...restProps}
            />
          </div>
        </div>
        <div className="relative mt-2">
          {open && selectables.length > 0 ?
            <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
              <CommandList>
                <CommandGroup className="h-full overflow-auto">
                  {selectables.map((option) => {
                    return (
                      <CommandItem
                        key={option.value}
                        onMouseDown={(e) => e.preventDefault()}
                        onSelect={() => {
                          setInputValue("")
                          setSelected(prev => [...prev, option])
                        }}
                        className={"cursor-pointer"}
                      >
                        {option.label}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </div>
            : null}
        </div>
      </Command >
  )
}
