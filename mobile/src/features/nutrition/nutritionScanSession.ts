import type { FoodCandidateViewModel } from './nutritionTypes';

let currentScanImageUri: string | undefined;
let pendingCandidateChange:
  | { type: 'add'; candidate: FoodCandidateViewModel }
  | { type: 'update'; candidate: FoodCandidateViewModel }
  | undefined;

export function setCurrentScanImageUri(uri: string) {
  currentScanImageUri = uri;
}

export function getCurrentScanImageUri() {
  return currentScanImageUri;
}

export function clearCurrentScanImageUri() {
  currentScanImageUri = undefined;
}

export function setPendingCandidateChange(
  change: { type: 'add'; candidate: FoodCandidateViewModel } | { type: 'update'; candidate: FoodCandidateViewModel },
) {
  pendingCandidateChange = change;
}

export function takePendingCandidateChange() {
  const change = pendingCandidateChange;
  pendingCandidateChange = undefined;
  return change;
}

export function clearPendingCandidateChange() {
  pendingCandidateChange = undefined;
}
