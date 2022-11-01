import { initeffecticons } from './effectIconReader';
import { initjudgeicons } from './judgeIconReader';
import { initnotesicons } from './noteIconReader';
import { initnotesounds } from './noteSoundReader';

/**
 * 初始化资源
 * @param onload 初始化完成的回调
 */
export const initResources = (onProgress: (type: string, amount: number, loaded: number, name: string) => void, onload: (info?: any) => void) => {
	initeffecticons(
		(amount: number, loaded: number, name: string) => {
			onProgress('effect', amount, loaded, name);
		},
		() => {
			initnotesicons(
				(amount: number, loaded: number, name: string) => {
					onProgress('note', amount, loaded, name);
				},
				() => {
					initjudgeicons(
						(amount: number, loaded: number, name: string) => {
							onProgress('judge', amount, loaded, name);
						},
						() => {
							initnotesounds((amount: number, loaded: number, name: string) => {
								onProgress('sounds', amount, loaded, name);
							},() => {
								onload();
							});
						}
					);
				}
			);
		}
	);
};
