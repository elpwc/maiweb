import tapIcon from './resource/img/tap.png';
import tapBreakIcon from './resource/img/tap_break.png';
import tapEachIcon from './resource/img/tap_each.png';
import tapSlideIcon from './resource/img/star.png';
import tapExIcon from './resource/img/tap_ex.png';
import tapSlideExIcon from './resource/img/star_ex.png';

import holdHeadIcon from './resource/img/hold_head.png';
import holdBodyIcon from './resource/img/hold_body.png';

import holdIcon from './resource/img/hold.png';
import holdEachIcon from './resource/img/hold_each.png';
import holdExIcon from './resource/img/hold_ex.png';

import holdShortIcon from './resource/img/short_hold.png';

import tapSoundData from './resource/sound/tap.wav';
import musicData from './resource/music/40mP - だんだん早くなる.mp3';

export const tap = new Image();
tap.src = tapIcon;
export const tapBreak = new Image();
tapBreak.src = tapBreakIcon;
export const tapEach = new Image();
tapEach.src = tapEachIcon;
export const tapSlide = new Image();
tapSlide.src = tapSlideIcon;
export const tapEx = new Image();
tapEx.src = tapExIcon;
export const tapSlideEx = new Image();
tapSlideEx.src = tapSlideExIcon;

export const hold = new Image();
hold.src = holdIcon;

export const holdHead = new Image();
holdHead.src = holdHeadIcon;
export const holdBody = new Image();
holdBody.src = holdBodyIcon;

export const holdShort = new Image();
holdShort.src = holdShortIcon;

export const tapSound = new Audio(tapSoundData);
tapSound.volume = 0.6;
export const music = new Audio(musicData);
music.volume = 0.3;
