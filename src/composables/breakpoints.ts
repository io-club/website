import {reactive, readonly} from 'vue';
import {useBreakpoint as useBr} from 'vue-composable';

import breakpointDef from '/@/breakpoints.json';

export const useBreakpoint = () => {
	return readonly(reactive(useBr(breakpointDef)));
}

export declare type BreakpointType = ReturnType<typeof useBreakpoint>
