import tapIcon from './resource/img/tap.png';
import tapBreakIcon from './resource/img/tap_break.png';
import tapEachIcon from './resource/img/tap_each.png';
import tapExIcon from './resource/img/tap_ex.png';

import tapSlideIcon from './resource/img/star.png';
import tapSlideBreakIcon from './resource/img/star_break.png';
import tapSlideEachIcon from './resource/img/star_each.png';
import tapSlideExIcon from './resource/img/star_ex.png';

import tapDoubleSlideIcon from './resource/img/star_double.png';
import tapDoubleSlideBreakIcon from './resource/img/star_break_double.png';
import tapDoubleSlideEachIcon from './resource/img/star_each_double.png';
import tapDoubleSlideExIcon from './resource/img/star_ex_double.png';

import holdIcon from './resource/img/hold.png';
import holdEachIcon from './resource/img/hold_each.png';
import holdExIcon from './resource/img/hold_ex.png';
import holdMissIcon from './resource/img/hold_miss.png';

import holdShortIcon from './resource/img/short_hold.png';
import holdEachShortIcon from './resource/img/short_hold_each.png';
import holdExShortIcon from './resource/img/short_hold_ex.png';
import holdMissShortIcon from './resource/img/short_hold_miss.png';

import touchIcon from './resource/img/UI_NOTES_Touch_01.png';
import touchCenterIcon from './resource/img/UI_NOTES_Touch_Point.png';

import touchEachIcon from './resource/img/UI_NOTES_Touch_Each_01.png';
import touchEachCenterIcon from './resource/img/UI_NOTES_Touch_Each_Point.png';

import touchHold1Icon from './resource/img/UI_NOTES_Touch_Hold_01.png';
import touchHold2Icon from './resource/img/UI_NOTES_Touch_Hold_04.png';
import touchHold3Icon from './resource/img/UI_NOTES_Touch_Hold_03.png';
import touchHold4Icon from './resource/img/UI_NOTES_Touch_Hold_02.png';
import touchHoldGageIcon from './resource/img/UI_NOTES_Touch_Hold_hold.png';

import tapSoundData from './resource/sound/tap.wav';
import musicData from './resource/music/40mP - だんだん早くなる.mp3';

export const holdHeadHeight: number = 70;

export const tap = new Image();
tap.src = tapIcon;
export const tapBreak = new Image();
tapBreak.src = tapBreakIcon;
export const tapEach = new Image();
tapEach.src = tapEachIcon;
export const tapEx = new Image();
tapEx.src = tapExIcon;

export const tapSlide = new Image();
tapSlide.src = tapSlideIcon;
export const tapSlideBreak = new Image();
tapSlideBreak.src = tapSlideBreakIcon;
export const tapSlideEach = new Image();
tapSlideEach.src = tapSlideEachIcon;
export const tapSlideEx = new Image();
tapSlideEx.src = tapSlideExIcon;

export const tapDoubleSlide = new Image();
tapDoubleSlide.src = tapDoubleSlideIcon;
export const tapDoubleSlideBreak = new Image();
tapDoubleSlideBreak.src = tapDoubleSlideBreakIcon;
export const tapDoubleSlideEach = new Image();
tapDoubleSlideEach.src = tapDoubleSlideEachIcon;
export const tapDoubleSlideEx = new Image();
tapDoubleSlideEx.src = tapDoubleSlideExIcon;

export const hold = new Image();
hold.src = holdIcon;
export const holdShort = new Image();
holdShort.src = holdShortIcon;

export const holdEach = new Image();
holdEach.src = holdEachIcon;
export const holdEachShort = new Image();
holdEachShort.src = holdEachShortIcon;

export const holdEx = new Image();
holdEx.src = holdExIcon;
export const holdExShort = new Image();
holdExShort.src = holdExShortIcon;

export const holdMiss = new Image();
holdMiss.src = holdMissIcon;
export const holdMissShort = new Image();
holdMissShort.src = holdMissShortIcon;

export const touch = new Image();
touch.src = touchIcon;
export const touchCenter = new Image();
touchCenter.src = touchCenterIcon;
export const touchEach = new Image();
touchEach.src = touchEachIcon;
export const touchEachCenter = new Image();
touchEachCenter.src = touchEachCenterIcon;

export const touchHold1 = new Image();
touchHold1.src = touchHold1Icon;
export const touchHold2 = new Image();
touchHold2.src = touchHold2Icon;
export const touchHold3 = new Image();
touchHold3.src = touchHold3Icon;
export const touchHold4 = new Image();
touchHold4.src = touchHold4Icon;
export const touchHoldGage = new Image();
touchHoldGage.src = touchHoldGageIcon;

export const tapSound = new Audio(tapSoundData);
tapSound.volume = 0.6;
export const music = new Audio(musicData);
music.volume = 0.3;
