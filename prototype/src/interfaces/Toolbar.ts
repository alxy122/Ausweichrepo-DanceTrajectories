import { ChangeEventHandler } from 'react';
import { Choreography, Pattern } from './Choreography';

export interface SelectOption {
  value: number;
  label: string;
  key: string;
}

export interface ToolbarProps {
  selectValue: number;
  selectOptions: SelectOption[];
  onSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  prevDisabled: boolean;
  nextDisabled: boolean;
  prevClick: () => void;
  nextClick: () => void;
  selectedPattern: number;
  setSelectedPattern: (selectedPattern:number) => void;

  toggleTransitionDisplay: () => void;
  showTransitions: boolean;

  show3DView: boolean;
  toggle3DView: () => void;
  
  showHeatmap: boolean;
  activateHeatmap: () => void;
  deactivateHeatmap: () => void;

  showShapes: boolean;
  activateShapes: () => void;
  deactivateShapes: () => void;
  editingModeActive: boolean;

  showOrientations: boolean;
  toggleOrientationsDisplay: ()=> void;
  
  setShowSliderForAnimatedChoreo: (newShowSliderValue: boolean) => void;

  setSpeedForAnimatedChoreo: (newSpeedValue: number) => void;
  speedForAnimatedChoreo: number;

  choreo: Choreography;

  addPattern: (newPattern:Pattern) => void;

  setCurrentlyInAnimation: (newValue: boolean) => void;
  animationSpeed: number;
}

export interface SelectProps {
  options: SelectOption[];
  value: number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  renderOnAllDevices: boolean;
}

export interface NewPatternButtonProps {
  choreo: Choreography;

  addPattern: (newPattern:Pattern) => void;
}

export interface AnimateChoreoButtonProps {
  nextClick: () => void;
  setSelectedPattern:(newSelectedPattern:number) => void;
  selectedPattern:number;
  choreo: Choreography;
  choreoLength:number;

  setShowSliderForAnimatedChoreo: (newShowSliderValue: boolean) => void;

  setSpeedForAnimatedChoreo: (newSpeedValue: number) => void;
  speedForAnimatedChoreo: number;
  forBottomToolbar: boolean;

  setCurrentlyInAnimation: (newValue: boolean) => void;
  animationSpeed: number;
}

export interface DismissibleAlertProps {
  show: boolean;
  setShow:(newShowValue: boolean)=>void;
  content: string;

}