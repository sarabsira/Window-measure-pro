import { WindowType, FurnishingType } from '../types';

export const windowTypeLabels: Record<WindowType, string> = {
  [WindowType.SINGLE_HUNG]: 'Single Hung',
  [WindowType.DOUBLE_HUNG]: 'Double Hung',
  [WindowType.CASEMENT]: 'Casement',
  [WindowType.AWNING]: 'Awning',
  [WindowType.SLIDING]: 'Sliding',
  [WindowType.FIXED]: 'Fixed',
  [WindowType.BAY]: 'Bay',
  [WindowType.BOW]: 'Bow',
  [WindowType.BIFOLD]: 'Bifold',
  [WindowType.STACKER]: 'Stacker',
  [WindowType.LOUVRE]: 'Louvre',
  [WindowType.SKYLIGHT]: 'Skylight',
  [WindowType.FRENCH_DOOR]: 'French Door',
  [WindowType.SLIDING_DOOR]: 'Sliding Door',
  [WindowType.BIFOLD_DOOR]: 'Bifold Door',
};

export const furnishingTypeLabels: Record<FurnishingType, string> = {
  [FurnishingType.ROLLER_BLIND]: 'Roller Blind',
  [FurnishingType.ROMAN_BLIND]: 'Roman Blind',
  [FurnishingType.VENETIAN_BLIND]: 'Venetian Blind',
  [FurnishingType.VERTICAL_BLIND]: 'Vertical Blind',
  [FurnishingType.PANEL_GLIDE]: 'Panel Glide',
  [FurnishingType.PLANTATION_SHUTTER]: 'Plantation Shutter',
  [FurnishingType.TIMBER_SHUTTER]: 'Timber Shutter',
  [FurnishingType.CURTAIN_EYELET]: 'Curtain – Eyelet',
  [FurnishingType.CURTAIN_PENCIL_PLEAT]: 'Curtain – Pencil Pleat',
  [FurnishingType.CURTAIN_S_FOLD]: 'Curtain – S-Fold',
  [FurnishingType.SHEER_CURTAIN]: 'Sheer Curtain',
  [FurnishingType.DUAL_ROLLER]: 'Dual Roller',
  [FurnishingType.HONEYCOMB_BLIND]: 'Honeycomb Blind',
  [FurnishingType.EXTERNAL_BLIND]: 'External Blind',
  [FurnishingType.EXTERNAL_AWNING]: 'External Awning',
  [FurnishingType.OUTDOOR_ROLLER]: 'Outdoor Roller',
};
