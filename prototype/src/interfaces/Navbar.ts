import { StringMappingType } from "typescript";
import { Choreography, Pattern } from "./Choreography";

export interface TopNavbarProps {
    gentlemanColor: string | number | readonly string[] | undefined;
    ladyColor: string | number | readonly string[] | undefined;
    coupleColor: string | number | readonly string[] | undefined;
    transitionColorScheme: string;

    setGentlemanColor: (color: string | number | readonly string[] | undefined) => void;
    setLadyColor: (color: string | number | readonly string[] | undefined) => void;
    setCoupleColor: (color: string | number | readonly string[] | undefined) => void;
    setTransitionColorScheme: (color:string)=>void;


    choreoName:string;
    choreoDescription:string;

    choreo: Choreography;
    loadChoreo:(newChoreo: Choreography) => void;

    setChoreoName:(newTitle: string) => void;
    setChoreoDescription:(newDescription: string) => void;

    animationSpeed: number;
    setAnimationSpeed: (newAnimationSpeed: number) => void;

    editingModeActive: boolean;
    setEditingModeActive: (newEditingModeActiveValue: boolean) => void;

    fineGridEnabled: boolean;
    setFineGridEnabled: (newFineGridEnabledValue: boolean) => void;

    discreteHeatmapEnabled: boolean;
    setDiscreteHeatmapEnabled: (newDiscreteHeatmapEnabledValue: boolean)=>void;

    gridDragEnabled: boolean;
    setGridDragEnabled: (newGridDragEnabled: boolean) => void;

    createNewChoreography: (newChoreoTitle: string, newChoreoDescription: string, numCouples: number, firstPattern: Pattern) => void;

    patternRotation: "Front"|"Back"|"Left"|"Right";
    setPatternRotation:(newPatternRotation: "Front"|"Back"|"Right"|"Left")=>void;

    showHeatmap: boolean;

}

export interface SettingsButtonProps {
    gentlemanColor: string | number | readonly string[] | undefined;
    ladyColor: string | number | readonly string[] | undefined;
    coupleColor: string | number | readonly string[] | undefined;
    transitionColorScheme: string;

    setGentlemanColor: (color: string | number | readonly string[] | undefined) => void;
    setLadyColor: (color: string | number | readonly string[] | undefined) => void;
    setCoupleColor: (color: string | number | readonly string[] | undefined) => void;
    setTransitionColorScheme: (color:string)=>void;

    choreoName:string;
    choreoDescription:string;

    setChoreoName:(newName: string) => void;
    setChoreoDescription:(newDescription: string) => void;

    animationSpeed: number;
    setAnimationSpeed: (newAnimationSpeed: number) => void;


    fineGridEnabled: boolean;
    setFineGridEnabled: (newFineGridEnabledValue: boolean) => void;

    discreteHeatmapEnabled: boolean;
    setDiscreteHeatmapEnabled: (newDiscreteHeatmapEnabledValue: boolean)=>void;

    gridDragEnabled: boolean;
    setGridDragEnabled: (newGridDragEnabled: boolean) => void;
}

export interface SaveChoreoButtonProps {
    choreo: Choreography;
}

export interface LoadChoreoButtonProps {
    loadChoreo:(newChoreo: Choreography) => void;
}

export interface NewChoreoButtonProps {
    createNewChoreography: (newChoreoName: string, newChoreoDescription: string, numCouples: number, firstPattern: Pattern) => void;
}

export interface UndoButtonProps {

}
