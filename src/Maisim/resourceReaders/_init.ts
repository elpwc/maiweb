import { initeffecticons } from './effectIconReader';
import { initnotesicons } from './noteIconReader';
import { initnotesounds } from './noteSoundReader';

/**
 * 初始化资源
 * @param onload 初始化完成的回调
 */
export const initResources = (onload: (info?: any) => void) => {
	initeffecticons(() => {
		initnotesicons(() => {
			initnotesounds(() => {
				onload();
			});
		});
	});
};
