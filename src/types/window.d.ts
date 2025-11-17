interface Window {
  updateNodeBorderColor?: (nodeId: string, color: string) => void;
  updateNodeBackgroundColor?: (nodeId: string, color: string) => void;
  copyNode?: (nodeId: string) => void;
  deleteNode?: (nodeId: string) => void;
}
