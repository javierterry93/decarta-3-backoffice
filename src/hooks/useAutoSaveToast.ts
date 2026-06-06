import { useCallback } from 'react';
import { toast } from 'sonner';

export function useAutoSaveToast() {
	return useCallback((message: string) => {
		toast.success(message, { duration: 3000 });
	}, []);
}
