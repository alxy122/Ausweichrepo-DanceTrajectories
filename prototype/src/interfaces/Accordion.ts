import React from "react";
import { Pattern } from "./Choreography";

export interface RemarksAccordionProps {
    pattern:Pattern;
    defaultKey: string;
    remarks: string;
    setRemarks(patternId:number, newRemarks: string): void;
    selectedPattern:number;
    editingModeActive: boolean;
}

export interface AccordionProps {
  title: string;
  defaultKey: string;
  child: React.ReactNode;
}