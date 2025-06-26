import { useBundleContext } from '../context/bundles-context';
import { BundleActionDialog } from './bundle-action-dialog';
import { BundleViewDialog } from './bundle-view-dialog';
import { BundleDeleteDialog } from './bundle-delete-dialog';

export function BundleDialogs() {
  const { dialogMode } = useBundleContext();

  if (!dialogMode) return null;

  return (
    <>
      {(dialogMode === 'create' || dialogMode === 'edit') && <BundleActionDialog />}
      {dialogMode === 'view' && <BundleViewDialog />}
      {dialogMode === 'delete' && <BundleDeleteDialog />}
    </>
  );
}